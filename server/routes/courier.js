import express from 'express';
import { Order } from '../models/Order.js';

const router = express.Router();

const FARDAR_CONFIG = {
  CLIENT_ID: process.env.FARDAR_CLIENT_ID || '11203',
  API_KEY: process.env.FARDAR_API_KEY || '40fcd37c2c268e75c0ef',
  ENDPOINT: 'https://www.fdedomestic.com/api/parcel/new_api_v1.php',
  PROVIDER_NAME: 'Fardar Express Domestic (PVT) LTD',
  SHORT_NAME: 'FED',
  STATUS: 'Active',
  TRACKING_URL: 'https://www.fdedomestic.com/tracking.php'
};

const FARDAR_STATUS_CODES = {
  '200': 'Successful insert',
  '201': 'Inactive Client',
  '202': 'Invalid order id',
  '203': 'Invalid weight',
  '204': 'Empty or invalid parcel description',
  '205': 'Empty or invalid name',
  '206': 'Contact number 1 is not valid (must be a valid 10-digit Sri Lankan phone)',
  '207': 'Contact number 2 is not valid',
  '208': 'Empty or invalid address',
  '209': 'Invalid City',
  '210': 'Unsuccessful insert, try again',
  '211': 'Invalid API key',
  '212': 'Invalid or inactive client',
  '213': 'Invalid exchange value',
  '214': 'System maintain mode is activated'
};

/**
 * Normalizes Sri Lankan phone numbers to 10 digits starting with 0 (e.g. 0771234567)
 */
export const cleanSriLankaPhone = (phone = '') => {
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length >= 11) {
    digits = '0' + digits.slice(2);
  } else if (!digits.startsWith('0') && digits.length === 9) {
    digits = '0' + digits;
  }
  return digits.slice(0, 10);
};

/**
 * Sends a pickup request directly to Fardar Express Domestic API
 */
export const sendFardarPickupRequest = async (parcelData) => {
  const params = new URLSearchParams();
  params.append('client_id', FARDAR_CONFIG.CLIENT_ID);
  params.append('api_key', FARDAR_CONFIG.API_KEY);
  params.append('order_id', String(parcelData.order_id || `ORD-${Date.now().toString().slice(-6)}`));
  params.append('parcel_weight', String(parcelData.parcel_weight || '1'));
  params.append('parcel_description', String(parcelData.parcel_description || 'Cosmetics & Skincare Essentials').slice(0, 200));
  params.append('recipient_name', String(parcelData.recipient_name || 'Valued Customer').slice(0, 100));
  params.append('recipient_contact_1', cleanSriLankaPhone(parcelData.recipient_contact_1));
  params.append('recipient_contact_2', parcelData.recipient_contact_2 ? cleanSriLankaPhone(parcelData.recipient_contact_2) : '');
  params.append('recipient_address', String(parcelData.recipient_address || 'Colombo, Sri Lanka').slice(0, 250));
  params.append('recipient_city', String(parcelData.recipient_city || 'Colombo').slice(0, 50));
  params.append('amount', String(Math.round(Number(parcelData.amount || 0))));
  params.append('exchange', String(parcelData.exchange || '0'));

  const response = await fetch(FARDAR_CONFIG.ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const rawText = await response.text();
  let jsonResult = null;
  try {
    jsonResult = JSON.parse(rawText);
  } catch (err) {
    throw new Error(`Invalid JSON response from Fardar API: ${rawText}`);
  }

  const statusCode = String(jsonResult.status || '');
  if (statusCode === '200') {
    return {
      success: true,
      statusCode: 200,
      waybillNumber: String(jsonResult.waybill_no || ''),
      message: 'Pickup request created successfully with Fardar Express Domestic',
      raw: jsonResult
    };
  }

  const errorMessage = FARDAR_STATUS_CODES[statusCode] || `Fardar API error (Code: ${statusCode})`;
  return {
    success: false,
    statusCode: Number(statusCode) || 400,
    error: errorMessage,
    raw: jsonResult
  };
};

// GET courier configuration
router.get('/fardar/config', (req, res) => {
  res.json({
    provider: FARDAR_CONFIG.PROVIDER_NAME,
    shortName: FARDAR_CONFIG.SHORT_NAME,
    clientId: FARDAR_CONFIG.CLIENT_ID,
    status: FARDAR_CONFIG.STATUS,
    endpoint: FARDAR_CONFIG.ENDPOINT,
    trackingUrl: FARDAR_CONFIG.TRACKING_URL
  });
});

// POST pickup request for a specific order
router.post('/fardar/pickup', async (req, res) => {
  try {
    const { orderId, parcelWeight, parcelDescription, amount, exchange, recipientContact2 } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ error: `Order "${orderId}" not found` });
    }

    // Determine parcel description from order items
    const desc = parcelDescription || (order.products && order.products.length > 0
      ? order.products.map(p => `${p.name || 'Item'} x${p.qty || 1}`).join(', ')
      : (order.notes || 'HAVEITALL Skincare & Cosmetics'));

    // Determine COD amount
    const isCOD = order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD';
    const parcelAmount = amount !== undefined ? amount : (isCOD ? order.total : 0);

    const fardarPayload = {
      order_id: order.id,
      parcel_weight: parcelWeight || '1',
      parcel_description: desc,
      recipient_name: order.customer,
      recipient_contact_1: order.phone,
      recipient_contact_2: recipientContact2 || '',
      recipient_address: order.address,
      recipient_city: order.city || 'Colombo',
      amount: parcelAmount,
      exchange: exchange || '0'
    };

    const result = await sendFardarPickupRequest(fardarPayload);

    if (result.success) {
      order.waybillNumber = result.waybillNumber;
      order.trackingNumber = result.waybillNumber;
      order.courierPartner = FARDAR_CONFIG.PROVIDER_NAME;
      if (order.status === 'Pending' || order.status === 'Payment Review') {
        order.status = 'Processing';
      }
      order.fardarStatus = 'Pickup Requested';
      order.fardarDispatchedAt = new Date();
      order.fardarResponse = result.raw;

      await order.save();

      console.log(`✅ Fardar Express Domestic pickup created for Order ${order.id}! Waybill: ${result.waybillNumber}`);

      return res.json({
        success: true,
        waybillNumber: result.waybillNumber,
        message: 'Waybill created and order updated successfully',
        order
      });
    }

    console.warn(`⚠️ Fardar Express Domestic returned error for Order ${order.id}:`, result.error);
    return res.status(400).json({
      success: false,
      error: result.error,
      code: result.statusCode,
      raw: result.raw
    });
  } catch (err) {
    console.error('❌ Error creating Fardar pickup:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST batch pickup requests for multiple orders
router.post('/fardar/batch-pickup', async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'orderIds array is required' });
    }

    const results = [];
    for (const orderId of orderIds) {
      const order = await Order.findOne({ id: orderId });
      if (!order) {
        results.push({ orderId, success: false, error: 'Order not found' });
        continue;
      }

      if (order.waybillNumber && order.waybillNumber.startsWith('API')) {
        results.push({ orderId, success: true, waybillNumber: order.waybillNumber, skipped: true });
        continue;
      }

      const desc = order.products && order.products.length > 0
        ? order.products.map(p => `${p.name} x${p.qty || 1}`).join(', ')
        : (order.notes || 'HAVEITALL Skincare & Cosmetics');

      const isCOD = order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD';
      const parcelAmount = isCOD ? order.total : 0;

      const fardarPayload = {
        order_id: order.id,
        parcel_weight: '1',
        parcel_description: desc,
        recipient_name: order.customer,
        recipient_contact_1: order.phone,
        recipient_address: order.address,
        recipient_city: order.city || 'Colombo',
        amount: parcelAmount,
        exchange: '0'
      };

      try {
        const result = await sendFardarPickupRequest(fardarPayload);
        if (result.success) {
          order.waybillNumber = result.waybillNumber;
          order.trackingNumber = result.waybillNumber;
          order.courierPartner = FARDAR_CONFIG.PROVIDER_NAME;
          order.fardarStatus = 'Pickup Requested';
          order.fardarDispatchedAt = new Date();
          order.fardarResponse = result.raw;
          await order.save();

          results.push({ orderId, success: true, waybillNumber: result.waybillNumber });
        } else {
          results.push({ orderId, success: false, error: result.error });
        }
      } catch (err) {
        results.push({ orderId, success: false, error: err.message });
      }
    }

    res.json({
      success: true,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST direct custom pickup request (without existing order)
router.post('/fardar/direct-pickup', async (req, res) => {
  try {
    const result = await sendFardarPickupRequest(req.body);
    if (result.success) {
      return res.json(result);
    }
    return res.status(400).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
