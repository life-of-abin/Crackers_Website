"use client";

import React from "react";

interface StockLimitNoticeProps {
  productName: string;
  stock: number;
  whatsappNumber?: string;
  phoneNumber?: string;
  className?: string;
  compact?: boolean;
}

export default function StockLimitNotice({
  productName,
  stock,
  whatsappNumber = "9629525907",
  phoneNumber = "9629525907",
  className = "",
  compact = false,
}: StockLimitNoticeProps) {
  // Clean phone number formats
  const rawWaNumber = whatsappNumber.replace(/[^0-9]/g, "");
  const formattedWaNumber = rawWaNumber.length === 10 ? `91${rawWaNumber}` : rawWaNumber;
  
  const rawPhone = phoneNumber.replace(/[^0-9]/g, "");
  const displayPhone = rawPhone.length === 10 ? rawPhone : phoneNumber;

  const whatsappMsg = encodeURIComponent(
    `Hi! I want to order more quantity of "${productName}". Currently only ${stock} items are available in stock. Could you please assist me with a bulk order?`
  );

  const whatsappUrl = `https://wa.me/${formattedWaNumber}?text=${whatsappMsg}`;
  const callUrl = `tel:${rawPhone}`;

  if (compact) {
    return (
      <div className={`bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 space-y-2 ${className}`}>
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-amber-600">⚠️</span>
          <span>Stock Limit ({stock} left in stock)</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-snug">
          Need more items? Contact us directly for bulk orders:
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-1.5 px-2 rounded-lg transition-colors shadow-xs"
          >
            <span>💬</span> WhatsApp
          </a>
          <a
            href={callUrl}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] py-1.5 px-2 rounded-lg transition-colors shadow-xs"
          >
            <span>📞</span> Call Us
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 via-amber-50/70 to-orange-50/60 border border-amber-200/90 rounded-2xl p-4 sm:p-4.5 shadow-sm space-y-3 animate-fadeIn ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-300/60 flex items-center justify-center text-lg flex-shrink-0 text-amber-700 shadow-xs">
          📦
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-black text-amber-950 font-display uppercase tracking-wider">
              Limited Stock Notice ({stock} {stock === 1 ? "Item" : "Items"} Available)
            </h4>
            <span className="bg-amber-200/70 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Stock Limit
            </span>
          </div>
          <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
            We have <strong className="font-extrabold text-amber-950">{stock} items</strong> in stock right now. If you want more quantity or wish to place a bulk order, please contact our team via WhatsApp or Call!
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="py-2.5 px-4 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <span className="text-sm">💬</span>
          <span>Contact via WhatsApp</span>
        </a>

        <a
          href={callUrl}
          onClick={(e) => e.stopPropagation()}
          className="py-2.5 px-4 rounded-xl font-extrabold text-xs bg-[#6D3FD6] hover:bg-[#5B21B6] active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <span className="text-sm">📞</span>
          <span>Call Us ({displayPhone})</span>
        </a>
      </div>
    </div>
  );
}
