import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Copy, Check } from 'lucide-react';

export const ProductBarcode = ({ product }) => {
  const svgRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const barcodeValue = product.barcode || `AXISX-${String(product.id).padStart(6, '0')}`;

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: 'CODE128',
          width: 1.8,
          height: 52,
          displayValue: true,
          font: 'monospace',
          fontSize: 13,
          textMargin: 6,
          fontOptions: 'bold',
          lineColor: '#0f172a',
          background: 'transparent',
          margin: 0
        });
      } catch (err) {
        console.error('Failed to generate barcode:', err);
      }
    }
  }, [barcodeValue]);

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 p-4 pt-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center justify-center">
      {/* Copy Code button in the top-right corner */}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-cyan-700 bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 transition-colors shadow-2xs z-10"
        title="Copy barcode number"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-bold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Code</span>
          </>
        )}
      </button>

      {/* Barcode with Number centered */}
      <div className="w-full flex justify-center overflow-x-auto pt-3 pb-1">
        <svg ref={svgRef} className="max-w-full h-auto"></svg>
      </div>
    </div>
  );
};
