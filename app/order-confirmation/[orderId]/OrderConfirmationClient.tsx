"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FireworksCanvas from "@/components/ui/FireworksCanvas";
import RocketAnimation from "@/components/ui/RocketAnimation";
import type { StoreSettings } from "@/lib/settings";

interface OrderConfirmationClientProps {
  order: any;
  settings: StoreSettings;
  formattedId: string;
  displayPaymentMethod: string;
  orderDate: string;
}

export default function OrderConfirmationClient({
  order,
  settings,
  formattedId,
  displayPaymentMethod,
  orderDate,
}: OrderConfirmationClientProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Auto-open WhatsApp on mount if triggered from checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("autoWhatsapp") === "true") {
      // Remove query param from URL cleanly
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Trigger WhatsApp Web / App
      const adminPhone = settings.supportPhone ? settings.supportPhone.replace(/[^0-9]/g, "") : "9629525907";
      const message = `*NEW ORDER PLACED!* 🛍️\n\n*Order ID:* ${formattedId}\n*Customer:* ${order.customerName}\n*Phone:* ${order.phone}\n*Address:* ${order.address}, ${order.city}, ${order.district}, ${order.state} - ${order.pincode}\n*Total Amount:* ₹${Number(order.totalAmount).toLocaleString("en-IN")}\n\n*Items Ordered:*\n${order.items.map((it: any) => `• ${it.productName} (x${it.quantity}) - ₹${Number(it.total).toLocaleString("en-IN")}`).join("\n")}\n\nThank you for choosing ${settings.storeName}!`;
      
      const waUrl = `https://wa.me/91${adminPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    }
  }, [order, settings, formattedId]);

  // Premium Canvas Order Summary Image Generator (ORDER-[orderId].png)
  const handleDownloadSummaryImage = () => {
    setIsGeneratingImage(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        alert("Canvas context unavailable.");
        setIsGeneratingImage(false);
        return;
      }

      // Canvas dimensions
      const width = 800;
      const baseHeight = 520 + order.items.length * 45;
      const height = Math.max(900, baseHeight);

      canvas.width = width * 2; // High DPI 2x
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // Background Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "#080B1A");
      bgGradient.addColorStop(1, "#0F172A");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Header Banner (#6D3FD6 Royal Purple)
      const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
      headerGrad.addColorStop(0, "#5B21B6");
      headerGrad.addColorStop(0.5, "#6D3FD6");
      headerGrad.addColorStop(1, "#7C3AED");
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, width, 110);

      // Header Text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(settings.storeName.toUpperCase(), width / 2, 45);

      ctx.fillStyle = "#F5C451";
      ctx.font = "800 14px sans-serif";
      ctx.fillText("OFFICIAL ORDER SUMMARY / INVOICE", width / 2, 75);

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "500 11px sans-serif";
      ctx.fillText("Sivakasi, Tamil Nadu, India • Direct Wholesale", width / 2, 95);

      // Card Container 1: Order Meta & Customer Info
      ctx.fillStyle = "#151A35";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      
      // Round Rect Helper
      const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };

      // Order ID & Status Box
      drawRoundRect(30, 130, 740, 110, 16);

      ctx.textAlign = "left";
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 12px sans-serif";
      ctx.fillText("ORDER NUMBER", 50, 160);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 18px monospace";
      ctx.fillText(formattedId, 50, 185);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 11px sans-serif";
      ctx.fillText(`DATE: ${orderDate}`, 50, 210);

      // Customer Details Box Right Side
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 12px sans-serif";
      ctx.fillText("CUSTOMER DETAILS", 420, 160);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 14px sans-serif";
      ctx.fillText(order.customerName, 420, 182);
      ctx.fillStyle = "#CBD5E1";
      ctx.font = "600 11px sans-serif";
      ctx.fillText(`Mobile: ${order.phone}`, 420, 200);
      ctx.fillText(`Email: ${order.email || "N/A"}`, 420, 218);

      // Delivery Address Box
      drawRoundRect(30, 255, 740, 75, 16);
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 11px sans-serif";
      ctx.fillText("DELIVERY ADDRESS", 50, 280);
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "600 11px sans-serif";
      const fullAddr = `${order.address}, ${order.city}, ${order.district ? `${order.district}, ` : ""}${order.state} - ${order.pincode}`;
      ctx.fillText(fullAddr.length > 90 ? fullAddr.slice(0, 90) + "..." : fullAddr, 50, 305);

      // Products Table Header
      let y = 350;
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(30, y, 740, 35);
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 11px sans-serif";
      ctx.fillText("PRODUCT NAME", 50, y + 22);
      ctx.fillText("QTY", 480, y + 22);
      ctx.fillText("PRICE", 570, y + 22);
      ctx.fillText("TOTAL", 680, y + 22);

      // Products Table Rows
      y += 35;
      order.items.forEach((item: any, idx: number) => {
        ctx.fillStyle = idx % 2 === 0 ? "#111827" : "#0F172A";
        ctx.fillRect(30, y, 740, 40);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 11px sans-serif";
        const nameStr = item.productName.length > 42 ? item.productName.slice(0, 42) + "..." : item.productName;
        ctx.fillText(nameStr, 50, y + 24);

        ctx.fillStyle = "#F5C451";
        ctx.font = "800 11px monospace";
        ctx.fillText(`${item.quantity} ${item.unitType || "BOX"}`, 480, y + 24);

        ctx.fillStyle = "#CBD5E1";
        ctx.font = "600 11px monospace";
        ctx.fillText(`₹${Number(item.price).toLocaleString("en-IN")}`, 570, y + 24);

        ctx.fillStyle = "#F5C451";
        ctx.font = "800 11px monospace";
        ctx.fillText(`₹${Number(item.total).toLocaleString("en-IN")}`, 680, y + 24);

        y += 40;
      });

      // Totals Box
      y += 15;
      drawRoundRect(480, y, 290, 110, 16);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("Subtotal:", 500, y + 30);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 11px monospace";
      ctx.fillText(`₹${Number(order.subtotal).toLocaleString("en-IN")}`, 700, y + 30);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("Delivery Fee:", 500, y + 55);
      ctx.fillStyle = "#34D399";
      ctx.font = "700 11px sans-serif";
      ctx.fillText(Number(order.shipping) === 0 ? "FREE" : `₹${Number(order.shipping)}`, 700, y + 55);

      ctx.fillStyle = "#F5C451";
      ctx.font = "900 13px sans-serif";
      ctx.fillText("GRAND TOTAL:", 500, y + 90);
      ctx.font = "900 16px monospace";
      ctx.fillText(`₹${Number(order.totalAmount).toLocaleString("en-IN")}`, 670, y + 90);

      // Footer Signature Note
      ctx.fillStyle = "#64748B";
      ctx.font = "500 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Thank you for shopping with Sri Sivakasi Crackers! Store Contact: 9629525907", width / 2, height - 20);

      // Convert Canvas to Blob & Trigger Download
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsGeneratingImage(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ORDER-${order.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsGeneratingImage(false);
      }, "image/png");
    } catch (err) {
      console.error("Failed to generate order image:", err);
      setIsGeneratingImage(false);
      alert("Could not generate summary image. Please try again.");
    }
  };

  // Direct WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const adminPhone = settings.supportPhone ? settings.supportPhone.replace(/[^0-9]/g, "") : "9629525907";
    const message = `*ORDER SUMMARY DETAILS* 🛍️\n\n*Order ID:* ${formattedId}\n*Customer:* ${order.customerName}\n*Phone:* ${order.phone}\n*Address:* ${order.address}, ${order.city}, ${order.district}, ${order.state} - ${order.pincode}\n*Total Amount:* ₹${Number(order.totalAmount).toLocaleString("en-IN")}\n\n*Items Ordered:*\n${order.items.map((it: any) => `• ${it.productName} (x${it.quantity}) - ₹${Number(it.total).toLocaleString("en-IN")}`).join("\n")}\n\nThank you for choosing ${settings.storeName}!`;
    
    const waUrl = `https://wa.me/91${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex flex-col justify-between relative overflow-hidden selection:bg-[#6D3FD6] selection:text-white">
      <Header settings={settings} />
      <FireworksCanvas durationSeconds={7} />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full text-center z-10 space-y-6 sm:space-y-8">
        
        {/* Main Dark Confirmation Card */}
        <div className="bg-[#151A35]/95 border border-[#6D3FD6]/40 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6 relative backdrop-blur-md">
          
          {/* Rocket Launch & Fireworks Celebration Animation */}
          <RocketAnimation />

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5C451] tracking-tight font-display uppercase">
              ORDER CONFIRMED! 🎉
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
              Your order has been placed successfully with <strong className="text-white">{settings.storeName}</strong>.
            </p>
          </div>

          {/* Key Confirmation Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            
            {/* Order ID */}
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Order ID
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono block truncate">{formattedId}</span>
            </div>

            {/* Payment Status & Method */}
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Payment Status & Method
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                  ✓ SUCCESS
                </span>
                <span className="text-xs font-bold text-slate-300">({displayPaymentMethod})</span>
              </div>
            </div>

            {/* Order Total & Date */}
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Order Total & Date
              </span>
              <div className="text-xs sm:text-sm font-bold text-white block">
                ₹{Number(order.totalAmount).toLocaleString("en-IN")} • <span className="text-slate-400 text-[11px]">{orderDate}</span>
              </div>
            </div>

          </div>

          {/* Customer Name & Delivery Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1.5">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Customer Details
              </span>
              <p className="font-extrabold text-white text-sm">{order.customerName}</p>
              <p className="text-slate-300">Mobile: <strong className="text-white font-mono">{order.phone}</strong></p>
              <p className="text-slate-300">Email: <span className="text-white">{order.email || "N/A"}</span></p>
            </div>

            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1.5">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Delivery Address
              </span>
              <p className="font-extrabold text-white">{order.customerName}</p>
              <p className="text-slate-300 leading-relaxed">
                {order.address}{order.landmark ? `, Near ${order.landmark}` : ""}, {order.city}, {order.district ? `${order.district}, ` : ""}{order.state} - <strong className="text-white font-mono">{order.pincode}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Order Products Table */}
          <div className="bg-[#080B1A]/90 border border-white/10 rounded-2xl overflow-hidden text-xs text-left shadow-lg">
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 font-extrabold text-[#F5C451] uppercase tracking-wider flex justify-between">
              <span>Purchased Products ({order.items.length})</span>
              <span>Total</span>
            </div>
            <div className="divide-y divide-white/10">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block text-xs sm:text-sm">{item.productName}</span>
                    <span className="text-[11px] text-slate-400 block">
                      Qty: <strong className="text-[#F5C451]">{item.quantity}</strong> {item.unitType || "BOX"}{item.quantity > 1 ? "ES" : ""} × ₹{Number(item.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="font-black text-[#F5C451] text-xs sm:text-sm font-mono flex-shrink-0">
                    ₹{Number(item.total).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Totals Summary */}
            <div className="p-4 bg-white/5 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-bold text-white">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount:</span>
                  <span>- ₹{Number(order.discount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Delivery Charges:</span>
                <span className={Number(order.shipping) === 0 ? "text-emerald-400 font-bold" : "font-bold text-white"}>
                  {Number(order.shipping) === 0 ? "FREE" : `₹${Number(order.shipping).toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-white uppercase">Grand Total:</span>
                <span className="text-lg text-[#F5C451] font-display">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Premium Download Button with Theme Color Palette & WhatsApp Share Button */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleDownloadSummaryImage}
              disabled={isGeneratingImage}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400"
            >
              <span>{isGeneratingImage ? "⌛ Generating Image..." : `📥 Download Summary Image (ORDER-${order.id}.png)`}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00B761] hover:bg-[#009E53] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
            >
              <span>💬 Send Summary to WhatsApp</span>
            </button>

            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              🛒 Continue Shopping →
            </Link>
          </div>

        </div>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
