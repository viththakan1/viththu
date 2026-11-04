import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Share2,
  CheckCircle,
  Truck,
  MessageCircle,
  X,
  FileText
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HAVEITALL_LOGO } from '../../assets/waybillLogo';

export const ShippingWaybill = ({
  order,
  onClose,
  showAdminControls = false,
  onUpdateStatus
}) => {
  const { formatPrice, settings, showToast } = useStore();
  const barcodeRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);

  // Extract or generate 8-digit numeric Waybill ID matching standard Fardar Express Domestic (e.g. 18666233)
  const rawIdDigits = (order?.waybillNumber || order?.trackingNumber || order?.id || '18666233').replace(/\D/g, '');
  const waybillId = rawIdDigits.length >= 7 ? rawIdDigits.slice(-8) : `18${(rawIdDigits || '666233').padStart(6, '0').slice(-6)}`;
  
  const isCOD = order?.paymentMethod === 'Cash on Delivery';
  const codAmount = order?.total ? `${Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR` : '10,500.00 LKR';
  
  // Parcel Description from ordered products
  const parcelDesc = (order?.products && order.products.length > 0)
    ? order.products.map(p => `${p.name}${p.qty > 1 ? ` x${p.qty}` : ''}`).join(', ')
    : (order?.notes || 'Skincare & Cosmetics Essentials');

  // Customer phone cleanup
  const recipientContact = (order?.phone || '766957989').replace(/^\+94/, '0').replace(/\s+/g, '');
  const senderContact = (order?.vendorPickupPhone || order?.dropshipSenderPhone || settings?.phone || '770650063').replace(/^\+94/, '0').replace(/\s+/g, '');
  const senderName = order?.dropshipperName || order?.vendorPickupName || (settings?.storeName ? `${settings.storeName.toLowerCase().replace(/\s+/g, '')}.lk` : 'myskin.lk');
  const senderAddress = order?.vendorPickupAddress || settings?.address || 'Sellathurai veethy mallakam jaffna near the mallakam Boc bank';

  // Render linear barcode (CODE128)
  useEffect(() => {
    if (barcodeRef.current && waybillId) {
      try {
        JsBarcode(barcodeRef.current, waybillId, {
          format: 'CODE128',
          width: 1.8,
          height: 52,
          displayValue: false, // Text is rendered cleanly underneath
          margin: 0,
          background: 'transparent',
          lineColor: '#000000'
        });
      } catch (err) {
        console.error('Failed to generate barcode:', err);
      }
    }
  }, [waybillId]);

  // Render 2D QR Code on Canvas encoding the exact waybill barcode number
  useEffect(() => {
    if (qrCanvasRef.current && waybillId) {
      // Exactly encodes the numeric barcode number so scanning the QR code reads the waybill barcode number directly
      const qrData = String(waybillId);
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 104,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error('Failed to generate QR Code:', err);
      });
    }
  }, [waybillId]);

  // Direct isolated iframe printing: guarantees EXACTLY 1 page, 100mm x 150mm, ZERO extra headers/footers
  const handlePrint = () => {
    try {
      // Get QR Code as high-res PNG
      let qrDataUrl = '';
      if (qrCanvasRef.current) {
        qrDataUrl = qrCanvasRef.current.toDataURL('image/png');
      }

      // Get Barcode SVG content
      const barcodeSvgHtml = barcodeRef.current ? barcodeRef.current.outerHTML : '';

      // Create isolated invisible iframe to avoid any outer DOM/React overflow
      const printIframe = document.createElement('iframe');
      printIframe.setAttribute('id', 'shipping-label-printer-iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);

      const storePickupName = senderName;
      const storePickupAddress = senderAddress;

      const iframeDoc = printIframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Waybill_${waybillId}</title>
  <style>
    @page {
      size: 100mm 150mm;
      margin: 0mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100mm;
      height: 150mm;
      max-width: 100mm;
      max-height: 150mm;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: "Times New Roman", Times, Georgia, serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .label-wrapper {
      width: 100mm;
      height: 150mm;
      max-width: 100mm;
      max-height: 150mm;
      box-sizing: border-box;
      border: 1.5px solid #000000;
      padding: 3mm 4mm 2mm 4mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      page-break-after: avoid;
      page-break-inside: avoid;
      break-after: avoid;
      break-inside: avoid;
      background: #ffffff;
    }
    .header-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-bottom: 2mm;
      border-bottom: 1.5px solid #000000;
      text-align: center;
    }
    .brand-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3mm;
    }
    .brand-logo-img {
      height: 12mm;
      max-height: 12mm;
      width: auto;
      object-fit: contain;
      display: block;
    }
    .brand-text-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      text-align: left;
    }
    .brand-name {
      font-size: 23px;
      font-weight: 900;
      letter-spacing: -0.5px;
      line-height: 1.05;
      color: #000000 !important;
      text-transform: uppercase;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    }
    .brand-subtitle {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      line-height: 1;
      color: #000000 !important;
      margin-top: 1mm;
      text-transform: uppercase;
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    }
    .waybill-header-id {
      font-size: 14.5px;
      font-weight: bold;
      color: #000000 !important;
      letter-spacing: 0.5px;
      margin-top: 1.5mm;
      font-family: "Courier New", Courier, monospace;
      text-align: center;
    }
    .details-box {
      padding: 2mm 0;
      border-bottom: 1px solid #000000;
      font-size: 14px;
      line-height: 1.3;
    }
    .details-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 1.2mm;
    }
    .field-row {
      margin-bottom: 0.8mm;
      word-break: break-word;
    }
    .cod-footer-section {
      padding-top: 1.8mm;
      padding-bottom: 0.5mm;
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .cod-headline {
      font-size: 16.5px;
      font-weight: bold;
      letter-spacing: -0.2px;
    }
    .codes-row {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 1mm 2mm;
    }
    .qr-image {
      width: 25mm;
      height: 25mm;
      display: block;
    }
    .barcode-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .barcode-container svg {
      width: 38mm;
      height: 16mm;
      display: block;
    }
    .barcode-id-text {
      font-family: monospace;
      font-size: 15px;
      letter-spacing: 2px;
      margin-top: 1mm;
    }
    .bottom-dash-divider {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: -1mm;
    }
    .bottom-line {
      width: 100%;
      border-bottom: 1px solid #000000;
      position: absolute;
      top: 50%;
      left: 0;
    }
    .dash-char {
      position: relative;
      background: #ffffff;
      padding: 0 2mm;
      font-size: 12px;
      z-index: 10;
      line-height: 1;
    }
  </style>
</head>
<body>
  <div class="label-wrapper">
    <!-- 1. HEADER (CENTER TOP BRAND LOGO + TEXT & WAYBILL ID) -->
    <div class="header-section">
      <div class="brand-container">
        <img src="${HAVEITALL_LOGO}" alt="HAVEITALL Logo" class="brand-logo-img" />
        <div class="brand-text-col">
          <div class="brand-name">HAVEITALL</div>
          <div class="brand-subtitle">Beauty and Lifestyle</div>
        </div>
      </div>
      <div class="waybill-header-id">
        Waybill ID : ${waybillId}
      </div>
    </div>

    <!-- 2. RECIPIENT DETAILS -->
    <div class="details-box">
      <div class="details-title">Recipient Details</div>
      <div class="field-row">Name: ${order?.customer || 'Lasith Ransiri'}</div>
      <div class="field-row">Address: ${order?.address || 'kudagammana bakery Giriulla outlet only, North Western, Kurunegala, Giriulla'}</div>
      <div class="field-row">Contact No: ${recipientContact}</div>
    </div>

    <!-- 3. PICKUP DETAILS -->
    <div class="details-box">
      <div class="details-title">Pickup Details</div>
      <div class="field-row">Name: ${storePickupName}</div>
      <div class="field-row">Address: ${storePickupAddress}</div>
      <div class="field-row">Contact No: ${senderContact}</div>
      <div class="field-row">Weight: 1kg</div>
      <div class="field-row">Order ID: ${order?.id || 'Msskincare'}</div>
      <div class="field-row">Parcel Desc: ${parcelDesc}</div>
    </div>

    <!-- 4. COD & CODES -->
    <div class="cod-footer-section">
      <div class="cod-headline">COD : ${isCOD ? codAmount : '0.00 LKR'}</div>
      
      <div class="codes-row">
        ${qrDataUrl ? `<img class="qr-image" src="${qrDataUrl}" alt="QR Code" />` : ''}
        <div class="barcode-container">
          ${barcodeSvgHtml}
          <div class="barcode-id-text">${waybillId}</div>
        </div>
      </div>

      <div class="bottom-dash-divider">
        <div class="bottom-line"></div>
        <span class="dash-char">-</span>
      </div>
    </div>
  </div>
</body>
</html>`);
      iframeDoc.close();

      // Trigger print inside the isolated document
      setTimeout(() => {
        try {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        } catch (e) {
          console.error('Error triggering iframe print:', e);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(printIframe)) {
              document.body.removeChild(printIframe);
            }
          }, 2000);
        }
      }, 200);
    } catch (err) {
      console.error('Print generation failed, fallback to window.print():', err);
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    const phoneClean = (order?.phone || '').replace(/\D/g, '');
    const message = `📦 *HAVEITALL Shipping Waybill*

Waybill ID: *${waybillId}*
Order ID: *${order?.id || 'ORD-001'}*

👤 *Recipient:* ${order?.customer || 'Customer'}
📍 *Address:* ${order?.address || 'Sri Lanka'}
📞 *Contact:* ${order?.phone || 'N/A'}

💰 *${isCOD ? 'COD Amount' : 'Prepaid'}:* ${isCOD ? `${formatPrice(order?.total || 0)}` : 'LKR 0.00 (PAID)'}
📦 *Parcel:* ${parcelDesc}

_HAVEITALL - Beauty and Lifestyle_`;

    const url = phoneClean
      ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    if (showToast) showToast('Opened WhatsApp with waybill details!');
  };

  const handleCopyWaybill = () => {
    navigator.clipboard.writeText(waybillId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (showToast) showToast('Waybill ID copied to clipboard!');
  };

  return (
    <div className="shipping-waybill-wrapper space-y-4">
      {/* Embedded Exact 100mm x 150mm Print Styling */}
      <style>{`
        @media print {
          @page {
            size: 100mm 150mm;
            margin: 0mm;
          }
          html, body {
            width: 100mm !important;
            height: 150mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          .fed-shipping-label-card,
          .fed-shipping-label-card * {
            visibility: visible !important;
          }
          .fed-shipping-label-card {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100mm !important;
            height: 150mm !important;
            max-width: 100mm !important;
            max-height: 150mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            border: 1.5pt solid #000000 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            overflow: hidden !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: "Times New Roman", Times, Georgia, serif !important;
          }
        }
      `}</style>

      {/* Action Toolbar (Hidden during print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
            <Truck className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading text-sm font-bold text-white">
                HAVEITALL Shipping Waybill
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                100mm × 150mm
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Exact replica of HAVEITALL courier shipping label for thermal sticker printing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label (100×150mm)</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send to WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyWaybill}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isCopied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
            <span>{isCopied ? 'Copied!' : 'Copy ID'}</span>
          </button>

          {showAdminControls && onUpdateStatus && order?.status !== 'Shipped' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id, 'Shipped')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Mark Shipped</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Waybill"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT REPLICA OF SAMPLE FARDAR EXPRESS DOMESTIC LABEL (100mm × 150mm)     */}
      {/* ========================================================================= */}
      <div className="flex justify-center p-2 sm:p-4 bg-slate-200/70 rounded-3xl border border-slate-300">
        <div
          className="fed-shipping-label-card bg-white text-black shadow-2xl relative select-text flex flex-col justify-between"
          style={{
            width: '100mm',
            height: '150mm',
            minWidth: '100mm',
            minHeight: '150mm',
            maxWidth: '100mm',
            maxHeight: '150mm',
            boxSizing: 'border-box',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            border: '1.5px solid #222222',
            padding: '3mm 4mm 2mm 4mm'
          }}
        >
          {/* SECTION 1: HEADER (CENTER TOP BRAND LOGO + TEXT & WAYBILL ID) */}
          <div className="flex flex-col items-center justify-center pb-2.5 border-b-[1.5px] border-black text-center">
            <div className="flex items-center justify-center gap-3">
              <img
                src={HAVEITALL_LOGO}
                alt="HAVEITALL Logo"
                className="w-auto object-contain"
                style={{ height: '12mm', maxHeight: '13mm' }}
              />
              <div className="flex flex-col text-left">
                <span className="text-[23px] font-black tracking-tight text-black uppercase leading-tight font-sans">
                  HAVEITALL
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-black mt-1 font-sans">
                  Beauty and Lifestyle
                </span>
              </div>
            </div>

            <div className="mt-1.5 text-center">
              <span className="font-bold text-[14.5px] tracking-tight text-black font-mono">
                Waybill ID : {waybillId}
              </span>
            </div>
          </div>

          {/* SECTION 2: RECIPIENT DETAILS */}
          <div className="py-2 border-b border-black text-[14px] leading-tight space-y-1">
            <h3 className="font-bold text-[16px] text-black pb-0.5">
              Recipient Details
            </h3>
            <p className="text-black">
              <span className="font-normal">Name: </span>
              <span className="font-normal">{order?.customer || 'Lasith Ransiri'}</span>
            </p>
            <p className="text-black leading-snug">
              <span className="font-normal">Address: </span>
              <span className="font-normal">{order?.address || 'kudagammana bakery Giriulla outlet only, North Western, Kurunegala, Giriulla'}</span>
            </p>
            <p className="text-black">
              <span className="font-normal">Contact No: </span>
              <span className="font-normal">{recipientContact}</span>
            </p>
          </div>

          {/* SECTION 3: PICKUP DETAILS */}
          <div className="py-2 border-b border-black text-[14px] leading-tight space-y-1">
            <h3 className="font-bold text-[16px] text-black pb-0.5">
              Pickup Details
            </h3>
            <p className="text-black">
              <span className="font-normal">Name: </span>
              <span className="font-normal">{senderName}</span>
            </p>
            <p className="text-black leading-snug">
              <span className="font-normal">Address: </span>
              <span className="font-normal">{senderAddress}</span>
            </p>
            <p className="text-black">
              <span className="font-normal">Contact No: </span>
              <span className="font-normal">{senderContact}</span>
            </p>
            <p className="text-black">
              <span className="font-normal">Weight: </span>
              <span className="font-normal">1kg</span>
            </p>
            <p className="text-black">
              <span className="font-normal">Order ID: </span>
              <span className="font-normal">{order?.id || 'Msskincare'}</span>
            </p>
            <p className="text-black leading-snug truncate max-w-[90mm]">
              <span className="font-normal">Parcel Desc: </span>
              <span className="font-normal">{parcelDesc}</span>
            </p>
          </div>

          {/* SECTION 4: COD & CODES (QR + BARCODE) */}
          <div className="pt-2 pb-1 text-center flex-1 flex flex-col justify-between">
            {/* Centered COD Text */}
            <div className="font-bold text-[16.5px] tracking-tight pb-1">
              COD : {isCOD ? codAmount : '0.00 LKR'}
            </div>

            {/* Bottom Row: QR Code Left + Linear Barcode Right */}
            <div className="flex items-center justify-around px-2 pb-1">
              {/* Left: 2D QR Code */}
              <div className="flex items-center justify-center">
                <canvas ref={qrCanvasRef} className="w-[25mm] h-[25mm]" />
              </div>

              {/* Right: Linear Barcode + Centered Number */}
              <div className="flex flex-col items-center justify-center">
                <svg ref={barcodeRef} className="w-[38mm] h-[16mm]" />
                <span className="font-normal text-[15px] tracking-widest text-black pt-0.5 font-mono">
                  {waybillId}
                </span>
              </div>
            </div>

            {/* Bottom Center Dash Gap (matching exact sample bottom border) */}
            <div className="relative w-full flex items-center justify-center -mb-1">
              <div className="w-full border-b border-black absolute top-1/2 left-0" />
              <span className="relative bg-white px-2 text-[12px] text-black select-none z-10 leading-none">
                -
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
