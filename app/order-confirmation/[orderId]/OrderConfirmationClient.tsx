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

  const isPickup = order.orderType === "PICKUP";
  const isDelivery = order.orderType === "DELIVERY" || !order.orderType;
  const deliveryCharge = Number(order.deliveryCharge ?? 0);
  const deliveryConfirmed = order.deliveryConfirmed === true;

  // Auto-open WhatsApp on mount if triggered from checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("autoWhatsapp") === "true") {
      // Remove query param from URL cleanly
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Trigger WhatsApp Web / App with Order Summary (NOT invoice)
      const adminPhone = settings.phone
        ? settings.phone.replace(/[^0-9]/g, "")
        : settings.whatsappNumber
        ? settings.whatsappNumber.replace(/[^0-9]/g, "")
        : "9629525907";

      const orderTypeLine = isPickup
        ? `*Order Type:* 🏪 Store Pickup (No Delivery Charge)`
        : `*Order Type:* 🚚 Home Delivery (Delivery Charge: To be Confirmed)`;

      const addressLine = isPickup
        ? `*Pickup From:* ${settings.address}`
        : `*Delivery Address:* ${order.address}, ${order.city}, ${order.district ?? ""} ${order.state} - ${order.pincode}`;

      const message =
        `*NEW ORDER PLACED - ORDER SUMMARY* 🛍️\n\n` +
        `*Order ID:* ${formattedId}\n` +
        `*Customer:* ${order.customerName}\n` +
        `*Phone:* ${order.phone}\n` +
        `${addressLine}\n` +
        `${orderTypeLine}\n` +
        `*Order Value:* ₹${Number(order.subtotal).toLocaleString("en-IN")}\n\n` +
        `*Items Ordered:*\n` +
        order.items
          .map(
            (it: any) =>
              `• ${it.productName} (×${it.quantity}) — ₹${Number(it.total).toLocaleString("en-IN")}`
          )
          .join("\n") +
        `\n\n` +
        (isDelivery
          ? `⚠️ Please confirm delivery charge for this order.\n\n`
          : ``) +
        `Thank you for choosing ${settings.storeName}!`;

      const waUrl = `https://wa.me/91${adminPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    }
  }, [order, settings, formattedId, isPickup, isDelivery]);

  // Premium Canvas Order Summary Image Generator
  // Filename: ORDER-SUMMARY-{id}.png (NOT invoice)
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
      const baseHeight = 560 + order.items.length * 45;
      const height = Math.max(960, baseHeight);

      canvas.width = width * 2; // High DPI 2x
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // Background Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "#080B1A");
      bgGradient.addColorStop(1, "#0F172A");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Header Banner (Royal Purple)
      const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
      headerGrad.addColorStop(0, "#5B21B6");
      headerGrad.addColorStop(0.5, "#6D3FD6");
      headerGrad.addColorStop(1, "#7C3AED");
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, width, 120);

      // Header Text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(settings.storeName.toUpperCase(), width / 2, 45);

      // ✅ CORRECT: "ORDER SUMMARY" — NOT "INVOICE"
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 15px sans-serif";
      ctx.fillText("ORDER SUMMARY", width / 2, 80);

      // Order type badge
      ctx.fillStyle = isPickup ? "#34D399" : "#A78BFA";
      ctx.font = "700 12px sans-serif";
      ctx.fillText(isPickup ? "🏪 STORE PICKUP" : "🚚 HOME DELIVERY", width / 2, 108);

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

      ctx.fillStyle = "#151A35";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;

      // Order ID & Status Box
      drawRoundRect(30, 140, 740, 110, 16);

      ctx.textAlign = "left";
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 12px sans-serif";
      ctx.fillText("ORDER NUMBER", 50, 170);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 18px monospace";
      ctx.fillText(formattedId, 50, 196);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 11px sans-serif";
      ctx.fillText(`DATE: ${orderDate}`, 50, 218);

      // Customer Details (right column)
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 12px sans-serif";
      ctx.fillText("CUSTOMER DETAILS", 420, 170);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 14px sans-serif";
      ctx.fillText(order.customerName, 420, 192);
      ctx.fillStyle = "#CBD5E1";
      ctx.font = "600 11px sans-serif";
      ctx.fillText(`Mobile: ${order.phone}`, 420, 210);
      ctx.fillText(`Email: ${order.email || "N/A"}`, 420, 228);

      // Address / Pickup Box
      drawRoundRect(30, 268, 740, 78, 16);
      ctx.fillStyle = "#F5C451";
      ctx.font = "800 11px sans-serif";
      ctx.fillText(isPickup ? "STORE PICKUP LOCATION" : "DELIVERY ADDRESS", 50, 293);
      ctx.fillStyle = "#E2E8F0";
      ctx.font = "600 11px sans-serif";
      if (isPickup) {
        ctx.fillText(settings.address, 50, 318);
        ctx.fillStyle = "#34D399";
        ctx.font = "700 11px sans-serif";
        ctx.fillText("Pickup is FREE — We will notify you when ready.", 50, 336);
      } else {
        const fullAddr = `${order.address}, ${order.city}, ${order.district ? `${order.district}, ` : ""}${order.state} - ${order.pincode}`;
        ctx.fillText(fullAddr.length > 90 ? fullAddr.slice(0, 90) + "..." : fullAddr, 50, 318);
      }

      // Products Table Header
      let y = 368;
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
      drawRoundRect(480, y, 290, 130, 16);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("Subtotal:", 500, y + 30);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 11px monospace";
      ctx.fillText(`₹${Number(order.subtotal).toLocaleString("en-IN")}`, 700, y + 30);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 11px sans-serif";
      ctx.fillText(isPickup ? "Pickup Charge:" : "Delivery Charge:", 500, y + 55);
      if (isPickup) {
        ctx.fillStyle = "#34D399";
        ctx.font = "700 11px sans-serif";
        ctx.fillText("FREE", 700, y + 55);
      } else if (deliveryConfirmed) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 11px monospace";
        ctx.fillText(`₹${deliveryCharge.toLocaleString("en-IN")}`, 700, y + 55);
      } else {
        ctx.fillStyle = "#FBBF24";
        ctx.font = "700 10px sans-serif";
        ctx.fillText("To be Confirmed", 660, y + 55);
      }

      ctx.fillStyle = "#F5C451";
      ctx.font = "900 13px sans-serif";
      ctx.fillText(isPickup || deliveryConfirmed ? "GRAND TOTAL:" : "ORDER VALUE:", 500, y + 95);
      ctx.font = "900 16px monospace";
      ctx.fillText(`₹${Number(order.totalAmount).toLocaleString("en-IN")}`, 670, y + 95);

      if (isDelivery && !deliveryConfirmed) {
        ctx.fillStyle = "#FBBF24";
        ctx.font = "600 9px sans-serif";
        ctx.fillText("* Final total includes delivery charge to be confirmed", 500, y + 118);
      }

      // Footer Note
      ctx.fillStyle = "#64748B";
      ctx.font = "500 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `This is an ORDER SUMMARY only, not a final invoice. Contact: ${settings.phone}`,
        width / 2,
        height - 22
      );
      ctx.fillStyle = "#3B4A6B";
      ctx.font = "500 9px sans-serif";
      ctx.fillText(`${settings.storeName} • Sivakasi, Tamil Nadu`, width / 2, height - 8);

      // ✅ CORRECT filename: ORDER-SUMMARY-{id}.png
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsGeneratingImage(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ORDER-SUMMARY-${order.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsGeneratingImage(false);
      }, "image/png");
    } catch (err) {
      console.error("Failed to generate order summary image:", err);
      setIsGeneratingImage(false);
      alert("Could not generate order summary image. Please try again.");
    }
  };

  // WhatsApp Share Handler (Order Summary — NOT invoice)
  const handleShareWhatsApp = () => {
    const adminPhone = settings.phone
      ? settings.phone.replace(/[^0-9]/g, "")
      : settings.whatsappNumber
      ? settings.whatsappNumber.replace(/[^0-9]/g, "")
      : "9629525907";

    const orderTypeLine = isPickup
      ? `*Order Type:* 🏪 Store Pickup (No Delivery Charge)`
      : `*Order Type:* 🚚 Home Delivery (Delivery Charge: ${deliveryConfirmed ? `₹${deliveryCharge.toLocaleString("en-IN")}` : "To be Confirmed"})`;

    const addressLine = isPickup
      ? `*Pickup From:* ${settings.address}`
      : `*Delivery Address:* ${order.address}, ${order.city}, ${order.district ?? ""} ${order.state} - ${order.pincode}`;

    const message =
      `*ORDER SUMMARY* 🛍️\n\n` +
      `*Order ID:* ${formattedId}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.phone}\n` +
      `${addressLine}\n` +
      `${orderTypeLine}\n` +
      `*Order Value:* ₹${Number(order.subtotal).toLocaleString("en-IN")}\n\n` +
      `*Items:*\n` +
      order.items
        .map(
          (it: any) =>
            `• ${it.productName} (×${it.quantity}) — ₹${Number(it.total).toLocaleString("en-IN")}`
        )
        .join("\n") +
      `\n\nThank you for choosing ${settings.storeName}!`;

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

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5C451] tracking-tight font-display uppercase">
              ORDER CONFIRMED! 🎉
            </h1>

            {/* Order Type Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
              isPickup
                ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/40"
                : "bg-purple-900/40 text-purple-300 border-purple-500/40"
            }`}>
              {isPickup ? "🏪 Store Pickup" : "🚚 Home Delivery"}
            </div>

            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
              Your order has been placed successfully with <strong className="text-white">{settings.storeName}</strong>.{" "}
              {isPickup
                ? "We'll notify you on WhatsApp when your order is ready for pickup."
                : "Our team will contact you to confirm the delivery charge."}
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

            {/* Order Type & Status */}
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Fulfillment Type
              </span>
              <div className={`text-xs font-extrabold uppercase ${isPickup ? "text-emerald-400" : "text-purple-300"}`}>
                {isPickup ? "🏪 Store Pickup" : "🚚 Home Delivery"}
              </div>
              {isPickup && (
                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-900/30 rounded px-1.5 py-0.5 inline-block mt-0.5">
                  No delivery charge
                </div>
              )}
              {isDelivery && (
                <div className="text-[10px] font-bold text-amber-400 bg-amber-900/30 rounded px-1.5 py-0.5 inline-block mt-0.5">
                  Delivery charge: {deliveryConfirmed ? `₹${deliveryCharge.toLocaleString("en-IN")}` : "Pending confirmation"}
                </div>
              )}
            </div>

            {/* Order Value & Date */}
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Order Value & Date
              </span>
              <div className="text-xs sm:text-sm font-bold text-white block">
                ₹{Number(order.subtotal).toLocaleString("en-IN")}{" "}
                <span className="text-slate-400 text-[11px]">• {orderDate}</span>
              </div>
              {isDelivery && !deliveryConfirmed && (
                <div className="text-[10px] text-amber-300 font-bold">+ delivery charge TBD</div>
              )}
            </div>

          </div>

          {/* Delivery notification banner */}
          {isDelivery && (
            <div className="bg-amber-900/30 border border-amber-500/40 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold uppercase tracking-wider text-[10px]">
                <span>⚠️</span> Delivery Charge Pending Confirmation
              </div>
              <p className="text-amber-200 font-medium">
                Our team will review your order and contact you on <strong className="text-white font-mono">{order.phone}</strong> to confirm the delivery charge for your location. You can pay the delivery charge at the time of delivery or online — whichever you prefer.
              </p>
            </div>
          )}

          {/* Pickup notification banner */}
          {isPickup && (
            <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">
                <span>🏪</span> Store Pickup — FREE
              </div>
              <p className="text-emerald-200 font-medium">
                We'll pack your order and notify you on <strong className="text-white font-mono">{order.phone}</strong> via WhatsApp when it&apos;s ready to pick up from our Sivakasi store. No delivery charge applies.
              </p>
            </div>
          )}

          {/* Customer Name & Address/Pickup Info */}
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
                {isPickup ? "Pickup Location" : "Delivery Address"}
              </span>
              {isPickup ? (
                <>
                  <p className="font-extrabold text-emerald-300 text-sm">{settings.storeName}</p>
                  <p className="text-slate-300 leading-relaxed">{settings.address}</p>
                  {settings.googleMapsUrl && (
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 font-bold text-[10px] hover:underline inline-flex items-center gap-1"
                    >
                      📍 View on Google Maps →
                    </a>
                  )}
                </>
              ) : (
                <>
                  <p className="font-extrabold text-white">{order.customerName}</p>
                  <p className="text-slate-300 leading-relaxed">
                    {order.address}{order.landmark ? `, Near ${order.landmark}` : ""}, {order.city},{" "}
                    {order.district ? `${order.district}, ` : ""}{order.state} -{" "}
                    <strong className="text-white font-mono">{order.pincode}</strong>
                  </p>
                </>
              )}
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
                      Qty: <strong className="text-[#F5C451]">{item.quantity}</strong>{" "}
                      {item.unitType || "BOX"}{item.quantity > 1 ? "ES" : ""} × ₹{Number(item.price).toLocaleString("en-IN")}
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
                <span>Items Subtotal:</span>
                <span className="font-bold text-white">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount:</span>
                  <span>- ₹{Number(order.discount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>{isPickup ? "Pickup Charge:" : "Delivery Charge:"}</span>
                {isPickup ? (
                  <span className="text-emerald-400 font-bold">FREE ✓</span>
                ) : deliveryConfirmed ? (
                  <span className="font-bold text-white">₹{deliveryCharge.toLocaleString("en-IN")}</span>
                ) : (
                  <span className="text-amber-400 font-bold">⏳ To be Confirmed</span>
                )}
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-white uppercase">
                  {isPickup || deliveryConfirmed ? "Grand Total:" : "Order Value:"}
                </span>
                <div className="text-right">
                  <span className="text-lg text-[#F5C451] font-display">
                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </span>
                  {isDelivery && !deliveryConfirmed && (
                    <div className="text-[9px] text-amber-400 font-medium">+ delivery charge</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Download Order Summary Image — NOT invoice */}
            <button
              type="button"
              onClick={handleDownloadSummaryImage}
              disabled={isGeneratingImage}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400"
            >
              <span>
                {isGeneratingImage
                  ? "⌛ Generating..."
                  : `📥 Download Order Summary (ORDER-SUMMARY-${order.id}.png)`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00B761] hover:bg-[#009E53] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
            >
              <span>💬 Send Order Summary to WhatsApp</span>
            </button>

            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              🛒 Continue Shopping →
            </Link>
          </div>

          {/* Track Order Link */}
          <div className="text-center text-[11px] text-slate-400">
            <p>
              To track your order status, visit{" "}
              <Link href="/track-order" className="text-[#F5C451] hover:underline font-bold">
                Track My Order →
              </Link>
            </p>
            <p className="mt-1">
              You&apos;ll need your Order ID: <strong className="text-white font-mono">{formattedId}</strong> and your email address.
            </p>
          </div>

        </div>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
