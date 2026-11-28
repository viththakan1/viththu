import express from 'express';
import { Order } from '../models/Order.js';
import { FARDAR_CITIES_BY_DISTRICT, ALL_FARDAR_CITIES } from '../utils/fardarCities.js';
import { authenticate, requireRole } from '../utils/auth.js';

const router = express.Router();

const FARDAR_CONFIG = {
  CLIENT_ID: process.env.FARDAR_CLIENT_ID || '11203',
  API_KEY: process.env.FARDAR_API_KEY || '40fcd37c2c268e75c0ef',
  ENDPOINT: 'https://www.fdedomestic.com/api/parcel/new_api_v1.php',
  NEW_WAYBILL_ENDPOINT: 'https://www.fdedomestic.com/api/parcel/new_api_v1.php',
  EXISTING_WAYBILL_ENDPOINT: 'https://www.fdedomestic.com/api/parcel/existing_waybill_api_v1.php',
  PROVIDER_NAME: 'Fardar Express Domestic (PVT) LTD',
  SHORT_NAME: 'FED',
  STATUS: 'Active',
  TRACKING_URL: 'https://www.fdedomestic.com/tracking.php',
  CALLBACK_URL: 'https://haveitall.lk/api/courier/fardar/callback'
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
  '209': 'Invalid City (must be an accepted Fardar Sri Lankan city)',
  '210': 'Unsuccessful insert, try again',
  '211': 'Invalid API key',
  '212': 'Invalid or inactive client',
  '213': 'Invalid exchange value',
  '214': 'System maintain mode is activated'
};

const FARDAR_EXISTING_STATUS_CODES = {
  '200': 'Successfully insert the parcel',
  '201': 'Incorrect waybill type. Only allow CRE or CCP',
  '202': 'The waybill is used',
  '203': 'The waybill is not yet assigned to this client',
  '204': 'Inactive Client',
  '205': 'Invalid order id',
  '206': 'Invalid weight',
  '207': 'Empty or invalid parcel description',
  '208': 'Empty or invalid name',
  '209': 'Invalid contact number 1',
  '210': 'Invalid contact number 2',
  '211': 'Empty or invalid address',
  '212': 'Empty or invalid amount (If you have CRE numbers, you can ignore or set as a 0 value to this)',
  '213': 'Invalid city',
  '214': 'Parcel insert unsuccessfully',
  '215': 'Invalid or inactive client',
  '216': 'Invalid API key',
  '217': 'Invalid exchange value',
  '218': 'System maintain mode is activated'
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
 * Sends a pickup request for a NEW waybill (calls new_api_v1.php)
 */
export const sendFardarNewWaybillPickup = async (parcelData) => {
  if (!FARDAR_CONFIG.CLIENT_ID || !FARDAR_CONFIG.API_KEY) {
    throw new Error('Fardar courier service is not configured. Missing FARDAR_CLIENT_ID or FARDAR_API_KEY environment variables.');
  }
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

  const response = await fetch(FARDAR_CONFIG.NEW_WAYBILL_ENDPOINT, {
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
      message: 'Pickup request created successfully with Fardar Express Domestic (New Waybill)',
      endpoint: 'new_api_v1',
      raw: jsonResult
    };
  }

  const errorMessage = FARDAR_STATUS_CODES[statusCode] || `Fardar API error (Code: ${statusCode})`;
  return {
    success: false,
    statusCode: Number(statusCode) || 400,
    error: errorMessage,
    endpoint: 'new_api_v1',
    raw: jsonResult
  };
};

/**
 * Sends a pickup request with an EXISTING / ASSIGNED waybill (calls existing_waybill_api_v1.php)
 */
export const sendFardarExistingWaybillPickup = async (parcelData) => {
  if (!FARDAR_CONFIG.CLIENT_ID || !FARDAR_CONFIG.API_KEY) {
    throw new Error('Fardar courier service is not configured. Missing FARDAR_CLIENT_ID or FARDAR_API_KEY environment variables.');
  }
  const waybillId = String(parcelData.waybill_id || parcelData.waybillNumber || parcelData.trackingNumber || '').trim();
  if (!waybillId) {
    throw new Error('waybill_id is required when using existing waybill pickup');
  }

  const params = new URLSearchParams();
  params.append('client_id', FARDAR_CONFIG.CLIENT_ID);
  params.append('api_key', FARDAR_CONFIG.API_KEY);
  params.append('waybill_id', waybillId);
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

  const response = await fetch(FARDAR_CONFIG.EXISTING_WAYBILL_ENDPOINT, {
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
    throw new Error(`Invalid JSON response from Fardar Existing Waybill API: ${rawText}`);
  }

  const statusCode = String(jsonResult.status || '');
  if (statusCode === '200') {
    return {
      success: true,
      statusCode: 200,
      waybillNumber: String(jsonResult.waybill_no || jsonResult.waybillID || waybillId),
      message: 'Parcel pickup registered successfully with existing Fardar waybill',
      endpoint: 'existing_waybill_api_v1',
      raw: jsonResult
    };
  }

  const errorMessage = FARDAR_EXISTING_STATUS_CODES[statusCode] || `Fardar Existing Waybill API error (Code: ${statusCode})`;
  return {
    success: false,
    statusCode: Number(statusCode) || 400,
    error: errorMessage,
    endpoint: 'existing_waybill_api_v1',
    raw: jsonResult
  };
};

/**
 * Universal dispatcher: routes to existing or new waybill API
 */
export const sendFardarPickupRequest = async (parcelData, options = {}) => {
  const useExisting = Boolean(options.useExistingWaybill || parcelData.useExistingWaybill || parcelData.waybill_id);
  if (useExisting) {
    return sendFardarExistingWaybillPickup(parcelData);
  }
  return sendFardarNewWaybillPickup(parcelData);
};

// GET courier configuration
router.get('/fardar/config', (req, res) => {
  res.json({
    provider: FARDAR_CONFIG.PROVIDER_NAME,
    shortName: FARDAR_CONFIG.SHORT_NAME,
    clientId: FARDAR_CONFIG.CLIENT_ID,
    status: FARDAR_CONFIG.STATUS,
    endpoint: FARDAR_CONFIG.ENDPOINT,
    newWaybillEndpoint: FARDAR_CONFIG.NEW_WAYBILL_ENDPOINT,
    existingWaybillEndpoint: FARDAR_CONFIG.EXISTING_WAYBILL_ENDPOINT,
    trackingUrl: FARDAR_CONFIG.TRACKING_URL,
    callbackUrl: FARDAR_CONFIG.CALLBACK_URL
  });
});

// GET verified Sri Lankan cities accepted by Fardar Express Domestic
router.get('/fardar/cities', (req, res) => {
  res.json({
    success: true,
    districts: FARDAR_CITIES_BY_DISTRICT,
    cities: ALL_FARDAR_CITIES,
    totalCities: ALL_FARDAR_CITIES.length
  });
});

/**
 * Map Fardar Express Domestic Delivery Statuses to Store Order Statuses
 */
export const mapFardarStatusToOrderStatus = (fardarStatus = '') => {
  const s = String(fardarStatus).trim().toLowerCase();
  if (!s) return null;

  if (
    s.includes('delivered') ||
    s.includes('complete') ||
    s.includes('handed to customer') ||
    s.includes('successful')
  ) {
    return 'Delivered';
  }

  if (
    s.includes('transit') ||
    s.includes('out for delivery') ||
    s.includes('dispatched') ||
    s.includes('on the way') ||
    s.includes('picked up') ||
    s.includes('in-transit')
  ) {
    return 'Shipped';
  }

  if (
    s.includes('return') ||
    s.includes('fail') ||
    s.includes('reject') ||
    s.includes('cancelled') ||
    s.includes('undelivered')
  ) {
    return 'Cancelled';
  }

  if (
    s.includes('process') ||
    s.includes('pack') ||
    s.includes('accept') ||
    s.includes('assign') ||
    s.includes('pickup requested') ||
    s.includes('pickup pending')
  ) {
    return 'Processing';
  }

  return null;
};

/**
 * Sets CORS headers explicitly for Fardar Express Domestic webhooks and portals
 */
const setCallbackCorsHeaders = (req, res) => {
  const origin = req.headers.origin || 'https://www.fdedomestic.com';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

/**
 * Handles Webhook / Callback POST requests from Fardar Express Domestic
 * Parameters received:
 * - waybill_id: Waybill ID / Tracking ID
 * - delivery_status (or current_status): Delivery status of parcel
 * - last_update_time: Last updated date & time of parcel
 */
export const handleFardarCallback = async (req, res) => {
  setCallbackCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 200,
      service: 'Fardar Express Domestic Webhook Callback Service',
      endpoint: FARDAR_CONFIG.CALLBACK_URL,
      expectedParameters: {
        waybill_id: 'Waybill ID / Tracking ID (POST)',
        delivery_status: 'Current delivery status of parcel (POST)',
        last_update_time: 'Last updated date & time of parcel (POST)'
      },
      sampleCurl: `curl -X POST https://haveitall.lk/api/courier/fardar/callback -d "waybill_id=API5834515&delivery_status=Delivered&last_update_time=2026-11-24 15:30:00"`
    });
  }

  try {
    const payload = req.body || {};
    const query = req.query || {};

    const waybillId = (
      payload.waybill_id ||
      payload.waybill_no ||
      payload.tracking_no ||
      payload.order_id ||
      query.waybill_id ||
      ''
    ).toString().trim();

    const deliveryStatus = (
      payload.delivery_status ||
      payload.current_status ||
      payload.status ||
      query.delivery_status ||
      query.current_status ||
      ''
    ).toString().trim();

    const lastUpdateTime = (
      payload.last_update_time ||
      payload.updated_time ||
      payload.lastUpdateTime ||
      query.last_update_time ||
      new Date().toISOString()
    ).toString().trim();

    console.log(`[Fardar Callback] Received: waybill_id="${waybillId}", delivery_status="${deliveryStatus}", last_update_time="${lastUpdateTime}"`);

    if (!waybillId) {
      return res.status(200).json({
        status: 200,
        warning: 'No waybill_id provided in callback payload',
        received: { payload, query }
      });
    }

    // Lookup order in MongoDB matching waybillNumber, trackingNumber, or id
    let order = await Order.findOne({
      $or: [
        { waybillNumber: waybillId },
        { trackingNumber: waybillId },
        { id: waybillId }
      ]
    });

    if (!order) {
      // Check case-insensitive match or numeric match without prefixes
      const cleanDigits = waybillId.replace(/\D/g, '');
      const regexPattern = new RegExp(waybillId, 'i');
      order = await Order.findOne({
        $or: [
          { waybillNumber: regexPattern },
          { trackingNumber: regexPattern },
          ...(cleanDigits.length >= 6 ? [
            { waybillNumber: new RegExp(cleanDigits, 'i') },
            { trackingNumber: new RegExp(cleanDigits, 'i') }
          ] : [])
        ]
      });
    }

    if (!order) {
      console.warn(`[Fardar Callback] Order not found for waybill "${waybillId}"`);
      return res.status(200).json({
        status: 200,
        warning: `No order found matching waybill "${waybillId}"`,
        received: {
          waybill_id: waybillId,
          delivery_status: deliveryStatus,
          last_update_time: lastUpdateTime
        }
      });
    }

    // Update order with live courier status
    order.fardarDeliveryStatus = deliveryStatus;
    order.fardarLastUpdate = lastUpdateTime;
    order.fardarStatus = deliveryStatus;

    const mappedStatus = mapFardarStatusToOrderStatus(deliveryStatus);
    if (mappedStatus) {
      order.status = mappedStatus;
      if (mappedStatus === 'Delivered') {
        order.deliveredAt = lastUpdateTime;
      }
    }

    // Append to courier tracking history
    if (!Array.isArray(order.fardarHistory)) {
      order.fardarHistory = [];
    }
    order.fardarHistory.push({
      status: deliveryStatus,
      mappedStatus: mappedStatus || order.status,
      timestamp: lastUpdateTime,
      receivedAt: new Date().toISOString()
    });

    await order.save();

    console.log(`✅ [Fardar Callback] Order ${order.id} updated! Status: "${order.status}" (Fardar: "${deliveryStatus}")`);

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Order status updated successfully in database',
      orderId: order.id,
      waybillId,
      status: order.status,
      fardarDeliveryStatus: deliveryStatus,
      lastUpdateTime
    });
  } catch (err) {
    console.error('❌ [Fardar Callback Error]:', err.message);
    return res.status(500).json({
      status: 500,
      error: err.message
    });
  }
};

// Register Webhook / Callback routes with multiple aliases
router.all(['/fardar/callback', '/fardar/webhook', '/callback', '/webhook'], handleFardarCallback);

// POST pickup request for a specific order (Admin only)
router.post('/fardar/pickup', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const {
      orderId,
      parcelWeight,
      parcelDescription,
      amount,
      exchange,
      recipientContact2,
      waybillId,
      useExistingWaybill
    } = req.body;

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

    // Check if using existing waybill endpoint
    const existingWaybillNumber = String(waybillId || order.waybillNumber || '').trim();
    const isExisting = Boolean(
      useExistingWaybill ||
      req.body.existing === true ||
      (existingWaybillNumber && (existingWaybillNumber.startsWith('CRE') || existingWaybillNumber.startsWith('CCP') || /^\d{7,8}$/.test(existingWaybillNumber)))
    );

    const fardarPayload = {
      order_id: order.id,
      waybill_id: existingWaybillNumber,
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

    const result = isExisting
      ? await sendFardarExistingWaybillPickup(fardarPayload)
      : await sendFardarNewWaybillPickup(fardarPayload);

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

      console.log(`✅ Fardar Express Domestic pickup (${result.endpoint}) created for Order ${order.id}! Waybill: ${result.waybillNumber}`);

      return res.json({
        success: true,
        waybillNumber: result.waybillNumber,
        endpoint: result.endpoint,
        message: result.message,
        order
      });
    }

    console.warn(`⚠️ Fardar Express Domestic returned error for Order ${order.id}:`, result.error);
    return res.status(400).json({
      success: false,
      error: result.error,
      code: result.statusCode,
      endpoint: result.endpoint,
      raw: result.raw
    });
  } catch (err) {
    console.error('❌ Error creating Fardar pickup:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST pickup request explicitly for an EXISTING waybill (Admin only)
router.post('/fardar/existing-pickup', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { orderId, waybillId, parcelWeight, parcelDescription, amount, exchange, recipientContact2 } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ error: `Order "${orderId}" not found` });
    }

    const assignedWaybill = String(waybillId || order.waybillNumber || order.trackingNumber || '').trim();
    if (!assignedWaybill) {
      return res.status(400).json({ error: 'waybillId is required for existing waybill pickup' });
    }

    const desc = parcelDescription || (order.products && order.products.length > 0
      ? order.products.map(p => `${p.name || 'Item'} x${p.qty || 1}`).join(', ')
      : (order.notes || 'HAVEITALL Skincare & Cosmetics'));

    const isCOD = order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD';
    const parcelAmount = amount !== undefined ? amount : (isCOD ? order.total : 0);

    const fardarPayload = {
      order_id: order.id,
      waybill_id: assignedWaybill,
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

    const result = await sendFardarExistingWaybillPickup(fardarPayload);
    if (result.success) {
      order.waybillNumber = result.waybillNumber;
      order.trackingNumber = result.waybillNumber;
      order.courierPartner = FARDAR_CONFIG.PROVIDER_NAME;
      if (order.status === 'Pending' || order.status === 'Payment Review') {
        order.status = 'Processing';
      }
      order.fardarStatus = 'Pickup Requested (Existing Waybill)';
      order.fardarDispatchedAt = new Date();
      order.fardarResponse = result.raw;

      await order.save();

      return res.json({
        success: true,
        waybillNumber: result.waybillNumber,
        message: result.message,
        order
      });
    }

    return res.status(400).json({
      success: false,
      error: result.error,
      code: result.statusCode,
      raw: result.raw
    });
  } catch (err) {
    console.error('❌ Error creating Fardar existing pickup:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST batch pickup requests for multiple orders (Admin only)
router.post('/fardar/batch-pickup', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
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

// POST direct custom pickup request (Admin only)
router.post('/fardar/direct-pickup', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
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
