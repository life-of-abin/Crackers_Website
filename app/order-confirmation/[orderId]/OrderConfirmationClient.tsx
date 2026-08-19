"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import HeroFireworks from "@/components/ui/HeroFireworks";
import { formatWhatsAppNumber } from "@/lib/pincode";

interface OrderConfirmationClientProps {
  order: any;
  settings: StoreSettings;
  formattedId: string;
  displayPaymentMethod: string;
  orderDate: string;
}

/**
 * Mask customer phone number for privacy, exposing only the last 4 digits.
 * E.g., "+919876543210" -> "+91********3210"
 */
function maskPhone(phoneNumber: string): string {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/\s+/g, "");
  const last4 = cleaned.slice(-4);
  if (cleaned.startsWith("+91")) {
    return `+91********${last4}`;
  }
  return `********${last4}`;
}

export default function OrderConfirmationClient({
  order,
  settings,
  formattedId,
  displayPaymentMethod,
  orderDate,
}: OrderConfirmationClientProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const { clearCart } = useCart();
  const hasClearedCart = useRef(false);

  useEffect(() => {
    // Clear the cart exactly once when the confirmation page loads successfully
    if (!hasClearedCart.current) {
      hasClearedCart.current = true;
      clearCart();
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("sivakasi_crackers_cart_v1");
          localStorage.setItem("sivakasi_crackers_cart_v1", "[]");
        } catch (e) {}
      }
    }
  }, [clearCart]);

  const isPickup = order.orderType === "PICKUP";
  const isDelivery = order.orderType === "DELIVERY" || !order.orderType;
  const deliveryCharge = Number(order.deliveryCharge ?? 0);
  const deliveryConfirmed = order.deliveryConfirmed === true;
  const maskedPhoneNumber = maskPhone(order.phone);

  // ── Manual PDF Generator using jsPDF ──────────────────────────────────────
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const primaryPurple = [109, 63, 214]; // #6D3FD6
      const accentGold = [245, 196, 81];    // #F5C451
      const textNavy = [15, 23, 42];        // #0F172A
      const textMuted = [100, 116, 139];    // #64748B
      const borderGray = [226, 232, 240];   // #E2E8F0
      const bgLight = [248, 250, 252];      // #F8FAFC

      // 1. Header Bar (Purple with Gold Accent Line below - No Phone/Email in header)
      doc.setFillColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.rect(0, 0, 210, 24, "F");

      doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
      doc.rect(0, 24, 210, 2, "F");

      // Store Title & Tagline in Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text((settings.storeName || "SRI SIVAKASI CRACKERS").toUpperCase(), 14, 13);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(233, 213, 255);
      doc.text("Direct Sivakasi Factory Quality • Genuine Festive Fireworks", 14, 19);

      // 2. Document Title & Meta Box
      doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("ORDER SUMMARY", 14, 35);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text("Official Pre-Dispatch Order Confirmation", 14, 40);

      // Right-side Meta Box
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(125, 30, 71, 22, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.text(`Order ID: ${formattedId}`, 130, 36);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
      doc.text(`Date: ${orderDate}`, 130, 42);
      doc.text(`Fulfillment: ${isPickup ? "Store Pickup" : "Home Delivery"}`, 130, 47);

      // Divider Line
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.line(14, 57, 196, 57);

      // 3. Two-Column Customer & Fulfillment Cards
      // Left Card: Customer Information
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(14, 62, 88, 30, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.text("CUSTOMER DETAILS", 18, 68);

      doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(order.customerName || "Valued Customer", 18, 74);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`Mobile: ${maskedPhoneNumber}`, 18, 80);
      doc.text(`Email: ${order.email || "N/A"}`, 18, 85);

      // Right Card: Delivery / Pickup Details
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(108, 62, 88, 30, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.text(isPickup ? "STORE PICKUP LOCATION" : "DELIVERY ADDRESS", 112, 68);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);

      if (isPickup) {
        doc.setFont("helvetica", "bold");
        doc.text(settings.storeName || "Sri Sivakasi Crackers Main Shop", 112, 74);
        doc.setFont("helvetica", "normal");
        const storeAddr = settings.address || "123 Main Bazaar, Sivakasi, Tamil Nadu 626123";
        const splitStore = doc.splitTextToSize(storeAddr, 80);
        doc.text(splitStore, 112, 79);
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
        doc.text("Pickup Charge: FREE (0 Extra Fees)", 112, 87);
      } else {
        const fullAddr = `${order.address}${order.landmark ? `, Near ${order.landmark}` : ""}, ${order.city}, ${order.district ? `${order.district}, ` : ""}${order.state} - ${order.pincode}`;
        const splitAddr = doc.splitTextToSize(fullAddr, 80);
        doc.text(splitAddr, 112, 74);
      }

      // 4. Items Table Header
      const tableTop = 98;
      doc.setFillColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.rect(14, tableTop, 182, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("#", 17, tableTop + 5.5);
      doc.text("PRODUCT NAME", 26, tableTop + 5.5);
      doc.text("PACK SIZE", 102, tableTop + 5.5);
      doc.text("QTY", 135, tableTop + 5.5, { align: "right" });
      doc.text("UNIT PRICE", 165, tableTop + 5.5, { align: "right" });
      doc.text("TOTAL (Rs.)", 192, tableTop + 5.5, { align: "right" });

      // 5. Itemized Table Rows
      let yPos = tableTop + 13;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      const confirmedPDFItems = order.items.filter((item: any) => item.isConfirmed !== false);

      confirmedPDFItems.forEach((item: any, idx: number) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        if (idx % 2 === 1) {
          doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
          doc.rect(14, yPos - 4.5, 182, 7.5, "F");
        }

        doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
        doc.text(String(idx + 1), 17, yPos);

        const prodName = item.productName || "Product Item";
        const splitName = doc.splitTextToSize(prodName, 72);
        doc.text(splitName, 26, yPos);

        const packSize = item.packSize || item.quantityPackage || "Standard";
        doc.text(String(packSize), 102, yPos);

        doc.text(
          `${item.quantity} ${item.unitType || "BOX"}${item.quantity > 1 ? "ES" : ""}`,
          135,
          yPos,
          { align: "right" }
        );
        doc.text(`Rs. ${Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 165, yPos, {
          align: "right",
        });
        doc.text(`Rs. ${Number(item.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 192, yPos, {
          align: "right",
        });

        const rowH = Math.max(7, splitName.length * 4.5);
        yPos += rowH;
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(14, yPos - 3, 196, yPos - 3);
      });

      // 6. Totals Summary Box
      yPos += 5;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);

      doc.text("Subtotal:", 135, yPos);
      doc.text(
        `Rs. ${Number(order.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        192,
        yPos,
        { align: "right" }
      );

      yPos += 5;
      if (Number(order.discount) > 0) {
        doc.text("Discount:", 135, yPos);
        doc.text(
          `- Rs. ${Number(order.discount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          192,
          yPos,
          { align: "right" }
        );
        yPos += 5;
      }

      doc.text(isPickup ? "Pickup Charge:" : "Delivery Charge:", 135, yPos);
      if (isPickup) {
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
        doc.text("FREE", 192, yPos, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
        yPos += 6;
      } else if (deliveryConfirmed) {
        doc.text(`Rs. ${deliveryCharge.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 192, yPos, {
          align: "right",
        });
        yPos += 6;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text("To be confirmed", 192, yPos, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
        yPos += 6;
      }

      // Grand Total Highlighted Box
      doc.setFillColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.roundedRect(125, yPos - 1, 71, 9, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(
        isPickup || deliveryConfirmed ? "GRAND TOTAL:" : "ORDER VALUE:",
        129,
        yPos + 5
      );
      doc.text(
        `Rs. ${Number(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        192,
        yPos + 5,
        { align: "right" }
      );

      // 7. Important Notes & Footer Section
      yPos += 18;
      if (yPos > 265) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(14, yPos, 182, 16, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.text("IMPORTANT INFORMATION:", 18, yPos + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(
        "1. This document is an official Order Summary receipt generated upon placing your order.",
        18,
        yPos + 9.5
      );
      doc.text(
        "2. Our store team from Sivakasi will contact you directly to confirm dispatch, transport, or shop pickup details.",
        18,
        yPos + 13.5
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
      doc.text(
        `Thank you for choosing ${settings.storeName || "Sri Sivakasi Crackers"}!`,
        105,
        yPos + 24,
        { align: "center" }
      );

      const filenameId = formattedId.replace("#", "");
      const pdfFilename = `ORDER-SUMMARY-${filenameId}.pdf`;

      doc.save(pdfFilename);
      setIsGeneratingPDF(false);
      setPdfDownloaded(true);
    } catch (err) {
      console.error("PDF generation error:", err);
      setIsGeneratingPDF(false);
    }
  };

  // ── Manual WhatsApp Share Handler ─────────────────────────────────────────
  const handleOpenWhatsApp = () => {
    const rawPhone = (settings as any).whatsappNumber || settings.phone || "9629525907";
    const adminPhone = formatWhatsAppNumber(rawPhone);

    const orderTypeLine = isPickup
      ? `*Order Type:* 🏪 Store Pickup (FREE — No Delivery Charge)`
      : `*Order Type:* 🚚 Home Delivery (Charge: ${
          deliveryConfirmed
            ? `₹${deliveryCharge.toLocaleString("en-IN")}`
            : "To be Confirmed by Admin"
        })`;

    const addressLine = isPickup
      ? `*Pickup From:* ${settings.address}`
      : `*Delivery To:* ${order.address}${
          order.landmark ? `, Near ${order.landmark}` : ""
        }, ${order.city}, ${order.district ? `${order.district}, ` : ""}${
          order.state
        } — ${order.pincode}`;

    const itemLines = order.items
      .map(
        (it: any) =>
          `  • ${it.productName} (×${it.quantity} ${it.unitType || "BOX"}) — ₹${Number(
            it.total
          ).toLocaleString("en-IN")}`
      )
      .join("\n");

    const message =
      `🛍️ *NEW ORDER — ${(
        settings.storeName || "Sri Sivakasi Crackers"
      ).toUpperCase()}*\n\n` +
      `*Order ID:* ${formattedId}\n` +
      `*Customer:* ${order.customerName}\n` +
      `*Phone:* ${order.phone}\n` +
      `*Email:* ${order.email || "N/A"}\n` +
      `${addressLine}\n` +
      `${orderTypeLine}\n\n` +
      `*Items Ordered (${order.items.length}):*\n${itemLines}\n\n` +
      `*Subtotal:* ₹${Number(order.subtotal).toLocaleString("en-IN")}\n` +
      (isDelivery && !deliveryConfirmed
        ? `⚠️ *Delivery Charge:* To be confirmed\n`
        : "") +
      `*Order Value:* ₹${Number(order.totalAmount).toLocaleString("en-IN")}\n\n` +
      (isDelivery && !deliveryConfirmed
        ? `⚠️ Please confirm the delivery charge for this order.\n\n`
        : "") +
      `Thank you! — ${settings.storeName}`;

    window.open(
      `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative selection:bg-[#6D3FD6] selection:text-white">
      <Header settings={settings} />

      {/* ── Subtle Background Fireworks Animation ─────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <HeroFireworks className="opacity-45" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full text-center space-y-6">

        {/* PDF Downloaded Banner (shown after user clicks download) */}
        {pdfDownloaded && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl px-5 py-3 flex items-center justify-center gap-3 text-left shadow-xs max-w-2xl mx-auto">
            <span className="text-xl flex-shrink-0">✅</span>
            <p className="text-emerald-800 font-bold text-xs sm:text-sm">
              Order summary downloaded successfully — check your Downloads folder.
            </p>
          </div>
        )}

        {/* ── Main Confirmation Card ──────────────────────────────────── */}
        <div className="bg-white border border-slate-200 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 text-left relative">

          {/* Success Checkmark & Heading */}
          <div className="text-center space-y-3 pb-2 border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-500 text-emerald-600 shadow-md mb-1">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#6D3FD6] tracking-tight font-display uppercase">
              ORDER CONFIRMED! 🎉
            </h1>

            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                isPickup
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-purple-50 text-[#6D3FD6] border-purple-200"
              }`}
            >
              {isPickup ? "🏪 Store Pickup" : "🚚 Home Delivery"}
            </div>
          </div>

          {/* ── Store Team Contact Message ──────────────────────────────── */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-emerald-50/80 border-2 border-[#6D3FD6]/25 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📞</span>
              <h2 className="text-[#6D3FD6] font-black text-base sm:text-lg">
                Our store team will call you shortly!
              </h2>
            </div>
            <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed pl-8">
              We have received your order. Our team at{" "}
              <strong className="text-slate-900 font-bold">
                {settings.storeName || "Sri Sivakasi Crackers"}
              </strong>{" "}
              will contact you on{" "}
              <strong className="text-[#6D3FD6] font-mono font-black">
                {maskedPhoneNumber}
              </strong>{" "}
              to confirm your order details.
            </p>
          </div>

          {/* ── Fulfillment Details: Pickup vs Home Delivery ────────────── */}
          {isPickup ? (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>🏪</span> Store Pickup Details
                </span>
                <span className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  Pickup FREE
                </span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                You can collect your order directly from our store after our team contacts you to confirm the details.
              </p>
              <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Store Name</span>
                  <span className="font-bold text-slate-900">{settings.storeName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Store Address</span>
                  <span className="font-medium text-slate-900">{settings.address}</span>
                </div>
              </div>
              {settings.googleMapsUrl && (
                <div className="pt-1">
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-bold text-[11px] hover:underline inline-flex items-center gap-1"
                  >
                    📍 Open Store in Google Maps →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#6D3FD6] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>🚚</span> Home Delivery Details
                </span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                    deliveryConfirmed
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {deliveryConfirmed
                    ? `Charge: ₹${deliveryCharge.toLocaleString("en-IN")}`
                    : "Delivery Charge Pending Confirmation"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-slate-700">
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Recipient Name</span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Contact Number</span>
                  <span className="font-mono font-bold text-slate-900">{maskedPhoneNumber}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">Delivery Address</span>
                  <span className="font-medium text-slate-900 leading-relaxed block">
                    {order.address}
                    {order.landmark ? `, Near ${order.landmark}` : ""},{" "}
                    {order.city},{" "}
                    {order.district ? `${order.district}, ` : ""}
                    {order.state} -{" "}
                    <span className="font-mono font-bold">{order.pincode}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Order Summary Heading & Manual PDF Download CTA ───────────── */}
          <div className="pt-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase font-display">
                  Order Summary
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order ID: <span className="font-mono font-bold text-slate-800">{formattedId}</span> • Placed: {orderDate}
                </p>
              </div>

              {/* PDF Manual Download Button */}
              <button
                id="download-order-summary-pdf-btn"
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6D3FD6] hover:bg-[#5B21B6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all border border-purple-400 cursor-pointer"
              >
                {isGeneratingPDF
                  ? "⌛ Generating PDF..."
                  : "📥 Download Your Order Summary (PDF)"}
              </button>
            </div>

            {/* Itemized Products Table */}
            {(() => {
              const confirmedItems = order.items.filter((item: any) => item.isConfirmed !== false);
              return (
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs text-left shadow-xs">
                  <div className="px-4 py-3 bg-[#6D3FD6] text-white font-extrabold uppercase tracking-wider flex justify-between">
                    <span>Ordered Products ({confirmedItems.length})</span>
                    <span>Total</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {confirmedItems.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 sm:p-4 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold block text-xs sm:text-sm text-slate-900">
                              {item.productName}
                            </span>
                          </div>
                          <span className="text-[11px] block text-slate-500">
                            Qty:{" "}
                            <strong className="text-[#6D3FD6] font-bold">
                              {item.quantity}
                            </strong>{" "}
                            {item.unitType || "BOX"}
                            {item.quantity > 1 ? "ES" : ""} × ₹
                            {Number(item.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="font-black text-xs sm:text-sm font-mono flex-shrink-0 text-slate-900">
                          ₹{Number(item.total).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

              {/* Summary Totals Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(order.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount:</span>
                    <span>
                      - ₹{Number(order.discount).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>
                    {isPickup ? "Pickup Charge:" : "Delivery Charge:"}
                  </span>
                  {isPickup ? (
                    <span className="text-emerald-700 font-bold">FREE ✓</span>
                  ) : deliveryConfirmed ? (
                    <span className="font-bold text-slate-900">
                      ₹{deliveryCharge.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold">
                      ⏳ Pending Confirmation
                    </span>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline font-black text-sm sm:text-base">
                  <span className="text-slate-900 uppercase font-display">
                    {isPickup || deliveryConfirmed ? "Final Order Total:" : "Order Subtotal Total:"}
                  </span>
                  <div className="text-right">
                    <span className="text-[#6D3FD6] font-mono text-base sm:text-lg">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Actions Row */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* WhatsApp Share Button (Manual Only) */}
            <button
              id="whatsapp-share-btn"
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00B761] hover:bg-[#009E53] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500"
            >
              💬 Share Order via WhatsApp
            </button>

            {/* Back to Home Button */}
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              🏠 Back to Home
            </Link>
          </div>

          {/* Track Order Footer Link */}
          <div className="text-center text-xs text-slate-500 pt-2 space-y-1">
            <p>
              Want to check status?{" "}
              <Link
                href="/track-order"
                className="text-[#6D3FD6] hover:underline font-bold"
              >
                Track Your Order →
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Order Reference: <strong className="font-mono text-slate-700">{formattedId}</strong>
            </p>
          </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
