"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
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
  const [showHoldBanner, setShowHoldBanner] = useState(false);
  const [jpegDownloaded, setJpegDownloaded] = useState(false);
  // Guard is active for 60s so user doesn't accidentally navigate away
  const guardActiveRef = useRef(true);

  const isPickup = order.orderType === "PICKUP";
  const isDelivery = order.orderType === "DELIVERY" || !order.orderType;
  const deliveryCharge = Number(order.deliveryCharge ?? 0);
  const deliveryConfirmed = order.deliveryConfirmed === true;

  // ── "Stay on Page" guard — active for 60 seconds after mount ─────────────
  useEffect(() => {
    guardActiveRef.current = true;
    const guardTimer = setTimeout(() => {
      guardActiveRef.current = false;
    }, 60000);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (guardActiveRef.current) {
        e.preventDefault();
        e.returnValue =
          "Your order summary is being prepared. Please wait a moment before leaving.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      clearTimeout(guardTimer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // ── Premium Light-Theme JPEG Canvas Generator ────────────────────────────
  const generateJPEG = useCallback(
    (onComplete?: () => void) => {
      setIsGeneratingImage(true);

      // Slight delay so React paints the loading state before the heavy canvas work
      setTimeout(() => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setIsGeneratingImage(false);
            onComplete?.();
            return;
          }

          // High-DPI 2× canvas
          const W = 800;
          const baseH = 640 + order.items.length * 44;
          const H = Math.max(920, baseH);
          canvas.width = W * 2;
          canvas.height = H * 2;
          ctx.scale(2, 2);

          // ── Helper: Rounded Rectangle ─────────────────────────────────────
          const roundRect = (
            x: number, y: number, w: number, h: number, r: number,
            fill: string, stroke?: string, strokeW = 1
          ) => {
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
            ctx.fillStyle = fill;
            ctx.fill();
            if (stroke) {
              ctx.strokeStyle = stroke;
              ctx.lineWidth = strokeW;
              ctx.stroke();
            }
          };

          // ── White background ──────────────────────────────────────────────
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, W, H);

          // ── Purple gradient header ────────────────────────────────────────
          const HEADER_H = 92;
          const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
          headerGrad.addColorStop(0, "#5B21B6");
          headerGrad.addColorStop(0.5, "#6D3FD6");
          headerGrad.addColorStop(1, "#7C3AED");
          ctx.fillStyle = headerGrad;
          ctx.fillRect(0, 0, W, HEADER_H);

          // Store name
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "900 22px Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            (settings.storeName || "Sri Sivakasi Crackers").toUpperCase(),
            W / 2,
            34
          );

          // Subtitle
          ctx.fillStyle = "#F5C451";
          ctx.font = "800 12px Arial, sans-serif";
          ctx.fillText("ORDER SUMMARY  —  NOT A TAX INVOICE", W / 2, 56);

          // Order type badge
          ctx.fillStyle = isPickup ? "#6EE7B7" : "#C4B5FD";
          ctx.font = "700 11px Arial, sans-serif";
          ctx.fillText(
            isPickup ? "🏪  STORE PICKUP  —  FREE" : "🚚  HOME DELIVERY",
            W / 2,
            78
          );

          // ── Gold accent bar under header ──────────────────────────────────
          ctx.fillStyle = "#F5C451";
          ctx.fillRect(0, HEADER_H, W, 3);

          // ── Order Info Card ───────────────────────────────────────────────
          const C1_Y = HEADER_H + 20;
          roundRect(28, C1_Y, W - 56, 102, 12, "#F8FAFC", "#E2E8F0");

          // Left column — Order number
          ctx.textAlign = "left";
          ctx.fillStyle = "#6D3FD6";
          ctx.font = "800 10px Arial, sans-serif";
          ctx.fillText("ORDER NUMBER", 46, C1_Y + 22);
          ctx.fillStyle = "#0F172A";
          ctx.font = "900 17px 'Courier New', monospace";
          ctx.fillText(formattedId, 46, C1_Y + 46);
          ctx.fillStyle = "#64748B";
          ctx.font = "600 10px Arial, sans-serif";
          ctx.fillText(`Placed: ${orderDate}`, 46, C1_Y + 64);
          ctx.fillText(`Payment: ${displayPaymentMethod}`, 46, C1_Y + 82);

          // Vertical divider
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(W / 2, C1_Y + 10);
          ctx.lineTo(W / 2, C1_Y + 90);
          ctx.stroke();

          // Right column — Customer
          ctx.fillStyle = "#6D3FD6";
          ctx.font = "800 10px Arial, sans-serif";
          ctx.fillText("CUSTOMER DETAILS", W / 2 + 18, C1_Y + 22);
          ctx.fillStyle = "#0F172A";
          ctx.font = "800 13px Arial, sans-serif";
          const custName = (order.customerName || "Customer").slice(0, 28);
          ctx.fillText(custName, W / 2 + 18, C1_Y + 44);
          ctx.fillStyle = "#64748B";
          ctx.font = "600 10px Arial, sans-serif";
          ctx.fillText(`📞 ${order.phone}`, W / 2 + 18, C1_Y + 62);
          ctx.fillText(
            `✉  ${(order.email || "N/A").slice(0, 30)}`,
            W / 2 + 18,
            C1_Y + 80
          );

          // ── Address / Pickup Card ─────────────────────────────────────────
          const C2_Y = C1_Y + 118;
          roundRect(28, C2_Y, W - 56, 72, 12, "#F8FAFC", "#E2E8F0");

          ctx.fillStyle = "#6D3FD6";
          ctx.font = "800 10px Arial, sans-serif";
          ctx.fillText(
            isPickup ? "PICKUP LOCATION" : "DELIVERY ADDRESS",
            46,
            C2_Y + 20
          );

          ctx.fillStyle = "#0F172A";
          ctx.font = "600 10.5px Arial, sans-serif";
          if (isPickup) {
            const storeAddr = (settings.address || "Sivakasi Store").slice(0, 80);
            ctx.fillText(storeAddr, 46, C2_Y + 40);
            ctx.fillStyle = "#059669";
            ctx.font = "700 10px Arial, sans-serif";
            ctx.fillText(
              "✓  Pickup is FREE — We'll notify you on WhatsApp when ready",
              46,
              C2_Y + 58
            );
          } else {
            const fullAddr = [
              order.address,
              order.landmark ? `Near ${order.landmark}` : "",
              order.city,
              order.district ? `${order.district},` : "",
              `${order.state} — ${order.pincode}`,
            ]
              .filter(Boolean)
              .join(", ");
            const truncAddr =
              fullAddr.length > 92 ? fullAddr.slice(0, 92) + "…" : fullAddr;
            ctx.fillText(truncAddr, 46, C2_Y + 40);
            ctx.fillStyle = deliveryConfirmed ? "#059669" : "#F59E0B";
            ctx.font = "700 10px Arial, sans-serif";
            ctx.fillText(
              deliveryConfirmed
                ? `✓  Delivery Charge: ₹${deliveryCharge.toLocaleString("en-IN")}`
                : "⏳  Delivery charge will be confirmed by our team",
              46,
              C2_Y + 58
            );
          }

          // ── Items Table ───────────────────────────────────────────────────
          const TABLE_Y = C2_Y + 90;

          // Table header row
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(28, TABLE_Y, W - 56, 32);
          ctx.fillStyle = "#F5C451";
          ctx.font = "800 10px Arial, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("#", 42, TABLE_Y + 21);
          ctx.fillText("PRODUCT NAME", 62, TABLE_Y + 21);
          ctx.textAlign = "right";
          ctx.fillText("QTY", 490, TABLE_Y + 21);
          ctx.fillText("UNIT PRICE", 590, TABLE_Y + 21);
          ctx.fillText("TOTAL", W - 42, TABLE_Y + 21);

          // Item rows
          let iy = TABLE_Y + 32;
          order.items.forEach((item: any, idx: number) => {
            // Alternating row background
            ctx.fillStyle = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
            ctx.fillRect(28, iy, W - 56, 42);

            // Row bottom border
            ctx.strokeStyle = "#E2E8F0";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(28, iy + 42);
            ctx.lineTo(W - 28, iy + 42);
            ctx.stroke();

            // Row number
            ctx.fillStyle = "#94A3B8";
            ctx.font = "600 9px Arial, sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(String(idx + 1), 40, iy + 25);

            // Product name + pack size
            const nameStr =
              item.productName.length > 40
                ? item.productName.slice(0, 40) + "…"
                : item.productName;
            ctx.fillStyle = "#0F172A";
            ctx.font = "700 10.5px Arial, sans-serif";
            ctx.fillText(nameStr, 60, iy + 19);
            ctx.fillStyle = "#64748B";
            ctx.font = "600 9px Arial, sans-serif";
            ctx.fillText(item.packSize || "10 Pieces", 60, iy + 34);

            // Qty (purple)
            ctx.fillStyle = "#6D3FD6";
            ctx.font = "800 10px 'Courier New', monospace";
            ctx.textAlign = "right";
            ctx.fillText(`${item.quantity} ${item.unitType || "BOX"}`, 490, iy + 25);

            // Price (muted)
            ctx.fillStyle = "#64748B";
            ctx.font = "600 10px 'Courier New', monospace";
            ctx.fillText(
              `₹${Number(item.price).toLocaleString("en-IN")}`,
              590,
              iy + 25
            );

            // Total (navy bold)
            ctx.fillStyle = "#0F172A";
            ctx.font = "800 10px 'Courier New', monospace";
            ctx.fillText(
              `₹${Number(item.total).toLocaleString("en-IN")}`,
              W - 42,
              iy + 25
            );

            iy += 42;
          });

          // ── Totals Summary Box (right-aligned) ────────────────────────────
          const TOTALS_Y = iy + 18;
          const hasDiscount = Number(order.discount) > 0;
          const totalsH = hasDiscount ? 150 : 130;
          roundRect(W - 298, TOTALS_Y, 270, totalsH, 12, "#F8FAFC", "#E2E8F0");

          let totLineY = TOTALS_Y + 26;

          const totRow = (label: string, value: string, valColor: string) => {
            ctx.textAlign = "left";
            ctx.fillStyle = "#64748B";
            ctx.font = "600 10px Arial, sans-serif";
            ctx.fillText(label, W - 284, totLineY);
            ctx.textAlign = "right";
            ctx.fillStyle = valColor;
            ctx.font = "700 10px 'Courier New', monospace";
            ctx.fillText(value, W - 42, totLineY);
            totLineY += 20;
          };

          totRow(
            "Subtotal:",
            `₹${Number(order.subtotal).toLocaleString("en-IN")}`,
            "#0F172A"
          );
          if (hasDiscount) {
            totRow(
              "Discount:",
              `−₹${Number(order.discount).toLocaleString("en-IN")}`,
              "#059669"
            );
          }
          if (isPickup) {
            totRow("Pickup Charge:", "FREE ✓", "#059669");
          } else if (deliveryConfirmed) {
            totRow(
              "Delivery Charge:",
              `₹${deliveryCharge.toLocaleString("en-IN")}`,
              "#0F172A"
            );
          } else {
            ctx.textAlign = "left";
            ctx.fillStyle = "#64748B";
            ctx.font = "600 10px Arial, sans-serif";
            ctx.fillText("Delivery Charge:", W - 284, totLineY);
            ctx.textAlign = "right";
            ctx.fillStyle = "#F59E0B";
            ctx.font = "700 9px Arial, sans-serif";
            ctx.fillText("To be Confirmed", W - 42, totLineY);
            totLineY += 20;
          }

          // Grand total separator
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(W - 284, totLineY + 2);
          ctx.lineTo(W - 42, totLineY + 2);
          ctx.stroke();
          totLineY += 18;

          ctx.textAlign = "left";
          ctx.fillStyle = "#6D3FD6";
          ctx.font = "900 12px Arial, sans-serif";
          ctx.fillText(
            isPickup || deliveryConfirmed ? "GRAND TOTAL" : "ORDER VALUE",
            W - 284,
            totLineY
          );
          ctx.textAlign = "right";
          ctx.font = "900 14px 'Courier New', monospace";
          ctx.fillText(
            `₹${Number(order.totalAmount).toLocaleString("en-IN")}`,
            W - 42,
            totLineY
          );

          if (isDelivery && !deliveryConfirmed) {
            ctx.fillStyle = "#F59E0B";
            ctx.font = "600 8.5px Arial, sans-serif";
            ctx.fillText(
              "* Final total after delivery charge confirmed",
              W - 42,
              totLineY + 14
            );
          }

          // ── Disclaimer text (left of totals box) ──────────────────────────
          ctx.textAlign = "left";
          ctx.fillStyle = "#94A3B8";
          ctx.font = "600 9px Arial, sans-serif";
          const disclaimerLines = [
            "This document is an Order Summary only.",
            "It is NOT a Tax Invoice.",
            "A Tax Invoice will be issued after",
            "payment confirmation by our team.",
          ];
          disclaimerLines.forEach((line, i) => {
            ctx.fillText(line, 44, TOTALS_Y + 26 + i * 16);
          });

          // ── Footer ────────────────────────────────────────────────────────
          const FOOT_Y = H - 40;
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(0, FOOT_Y - 8, W, 48);
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, FOOT_Y - 8);
          ctx.lineTo(W, FOOT_Y - 8);
          ctx.stroke();

          ctx.textAlign = "center";
          ctx.fillStyle = "#6D3FD6";
          ctx.font = "800 11px Arial, sans-serif";
          ctx.fillText(
            settings.storeName || "Sri Sivakasi Crackers",
            W / 2,
            FOOT_Y + 8
          );
          ctx.fillStyle = "#64748B";
          ctx.font = "600 9px Arial, sans-serif";
          ctx.fillText(
            `📞 ${settings.phone || "9629525907"}   |   ✉ ${settings.email || "contact@sivakasicrackers.com"}   |   Sivakasi, Tamil Nadu`,
            W / 2,
            FOOT_Y + 24
          );

          // ── Download as JPEG ──────────────────────────────────────────────
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setIsGeneratingImage(false);
                onComplete?.();
                return;
              }
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              a.download = `ORDER-SUMMARY-${order.id}.jpeg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(blobUrl);
              setIsGeneratingImage(false);
              setJpegDownloaded(true);
              onComplete?.();
            },
            "image/jpeg",
            0.95
          );
        } catch (err) {
          console.error("JPEG generation error:", err);
          setIsGeneratingImage(false);
          onComplete?.();
        }
      }, 120);
    },
    [
      order,
      settings,
      formattedId,
      displayPaymentMethod,
      orderDate,
      isPickup,
      isDelivery,
      deliveryCharge,
      deliveryConfirmed,
    ]
  );

  // ── WhatsApp message builder ──────────────────────────────────────────────
  const openWhatsApp = useCallback(() => {
    const adminPhone = (
      settings.phone ||
      (settings as any).whatsappNumber ||
      "9629525907"
    ).replace(/[^0-9]/g, "");

    const orderTypeLine = isPickup
      ? `*Order Type:* 🏪 Store Pickup (FREE — No Delivery Charge)`
      : `*Order Type:* 🚚 Home Delivery (Charge: ${
          deliveryConfirmed
            ? `₹${deliveryCharge.toLocaleString("en-IN")}`
            : "To be Confirmed by Admin"
        })`;

    const addressLine = isPickup
      ? `*Pickup From:* ${settings.address}`
      : `*Delivery To:* ${order.address}${order.landmark ? `, Near ${order.landmark}` : ""}, ${order.city}, ${order.district ? `${order.district}, ` : ""}${order.state} — ${order.pincode}`;

    const itemLines = order.items
      .map(
        (it: any) =>
          `  • ${it.productName} (×${it.quantity} ${it.unitType || "BOX"}) — ₹${Number(it.total).toLocaleString("en-IN")}`
      )
      .join("\n");

    const message =
      `🛍️ *NEW ORDER — ${(settings.storeName || "Sri Sivakasi Crackers").toUpperCase()}*\n\n` +
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
      `📎 *Order Summary JPEG* auto-downloaded as ORDER-SUMMARY-${order.id}.jpeg\n\n` +
      `Thank you! — ${settings.storeName}`;

    window.open(
      `https://wa.me/91${adminPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  }, [
    order,
    settings,
    formattedId,
    isPickup,
    isDelivery,
    deliveryCharge,
    deliveryConfirmed,
  ]);

  // ── Auto-action on ?autoWhatsapp=true ─────────────────────────────────────
  // Step 1: Show "hold on" banner + auto-generate + download JPEG
  // Step 2: 800ms after download completes → open WhatsApp with order summary
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("autoWhatsapp") !== "true") return;

    // Clean the query param from URL immediately
    window.history.replaceState({}, document.title, window.location.pathname);

    // Show "hold on" banner
    setShowHoldBanner(true);

    // Step 1: Generate + download JPEG
    generateJPEG(() => {
      setShowHoldBanner(false);
      // Step 2: Open WhatsApp 800ms after JPEG is downloaded
      setTimeout(() => {
        openWhatsApp();
      }, 800);
    });
  }, [generateJPEG, openWhatsApp]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative selection:bg-[#6D3FD6] selection:text-white">
      <Header settings={settings} />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full text-center space-y-4 sm:space-y-5">

        {/* ── "Hold On" Pulsing Banner ────────────────────────────────── */}
        {showHoldBanner && (
          <div className="animate-pulse bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 flex items-start gap-3 text-left shadow-sm">
            <div className="text-2xl flex-shrink-0 mt-0.5">⏳</div>
            <div>
              <p className="text-amber-700 font-extrabold text-sm">
                Preparing Your Order Summary...
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                Please stay on this page. Your premium order summary JPEG is being
                generated and will download automatically in a moment.
              </p>
            </div>
          </div>
        )}

        {/* ── JPEG Downloaded Confirmation ────────────────────────────── */}
        {jpegDownloaded && !showHoldBanner && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl px-5 py-3 flex items-center gap-3 text-left shadow-sm">
            <div className="text-xl flex-shrink-0">✅</div>
            <p className="text-emerald-700 font-bold text-sm">
              Order summary saved as{" "}
              <span className="font-mono text-emerald-900">
                ORDER-SUMMARY-{order.id}.jpeg
              </span>{" "}
              — check your Downloads folder.
            </p>
          </div>
        )}

        {/* ── Main Confirmation Card ──────────────────────────────────── */}
        <div className="bg-white border border-slate-200 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative">

          {/* Rocket + Firework celebration animation */}
          <RocketAnimation />

          {/* Heading */}
          <div className="space-y-3">
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

            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              Your order has been placed with{" "}
              <strong className="text-slate-900">{settings.storeName}</strong>.{" "}
              {isPickup
                ? "We'll notify you on WhatsApp when your order is ready for pickup."
                : "Our team will contact you to confirm the delivery charge before dispatch."}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Order ID
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono block truncate">
                {formattedId}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Fulfillment Type
              </span>
              <div
                className={`text-xs font-extrabold uppercase ${
                  isPickup ? "text-emerald-700" : "text-[#6D3FD6]"
                }`}
              >
                {isPickup ? "🏪 Store Pickup" : "🚚 Home Delivery"}
              </div>
              {isPickup && (
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 inline-block mt-0.5">
                  No delivery charge
                </div>
              )}
              {isDelivery && (
                <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 inline-block mt-0.5">
                  Delivery charge:{" "}
                  {deliveryConfirmed
                    ? `₹${deliveryCharge.toLocaleString("en-IN")}`
                    : "Pending confirmation"}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Order Value & Date
              </span>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                ₹{Number(order.subtotal).toLocaleString("en-IN")}{" "}
                <span className="text-slate-500 text-[11px]">• {orderDate}</span>
              </div>
              {isDelivery && !deliveryConfirmed && (
                <div className="text-[10px] text-amber-600 font-bold">
                  + delivery charge TBD
                </div>
              )}
            </div>
          </div>

          {/* Delivery charge pending banner */}
          {isDelivery && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-700 font-extrabold uppercase tracking-wider text-[10px]">
                <span>⚠️</span> Delivery Charge Pending Confirmation
              </div>
              <p className="text-amber-800 font-medium">
                Our team will contact you on{" "}
                <strong className="text-amber-900 font-mono">{order.phone}</strong>{" "}
                to confirm the delivery charge for your location. You can pay at
                the time of delivery or online — whichever you prefer.
              </p>
            </div>
          )}

          {/* Pickup ready banner */}
          {isPickup && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold uppercase tracking-wider text-[10px]">
                <span>🏪</span> Store Pickup — FREE
              </div>
              <p className="text-emerald-800 font-medium">
                We'll pack your order and notify you on{" "}
                <strong className="text-emerald-900 font-mono">{order.phone}</strong>{" "}
                via WhatsApp when it&apos;s ready to collect from our Sivakasi
                store. No delivery charge applies.
              </p>
            </div>
          )}

          {/* Customer + Address grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Customer Details
              </span>
              <p className="font-extrabold text-slate-900 text-sm">
                {order.customerName}
              </p>
              <p className="text-slate-500">
                Mobile:{" "}
                <strong className="text-slate-900 font-mono">{order.phone}</strong>
              </p>
              <p className="text-slate-500">
                Email:{" "}
                <span className="text-slate-900">{order.email || "N/A"}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                {isPickup ? "Pickup Location" : "Delivery Address"}
              </span>
              {isPickup ? (
                <>
                  <p className="font-extrabold text-emerald-700 text-sm">
                    {settings.storeName}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {settings.address}
                  </p>
                  {(settings as any).googleMapsUrl && (
                    <a
                      href={(settings as any).googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-bold text-[10px] hover:underline inline-flex items-center gap-1"
                    >
                      📍 View on Google Maps →
                    </a>
                  )}
                </>
              ) : (
                <>
                  <p className="font-extrabold text-slate-900">
                    {order.customerName}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {order.address}
                    {order.landmark ? `, Near ${order.landmark}` : ""},{" "}
                    {order.city},{" "}
                    {order.district ? `${order.district}, ` : ""}
                    {order.state} -{" "}
                    <strong className="text-slate-900 font-mono">
                      {order.pincode}
                    </strong>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs text-left shadow-sm">
            <div className="px-4 py-3 bg-[#6D3FD6] border-b border-purple-700 font-extrabold text-white uppercase tracking-wider flex justify-between">
              <span>Purchased Products ({order.items.length})</span>
              <span>Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                      {item.productName}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Qty:{" "}
                      <strong className="text-[#6D3FD6]">{item.quantity}</strong>{" "}
                      {item.unitType || "BOX"}
                      {item.quantity > 1 ? "ES" : ""} × ₹
                      {Number(item.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="font-black text-[#6D3FD6] text-xs sm:text-sm font-mono flex-shrink-0">
                    ₹{Number(item.total).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal:</span>
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
              <div className="flex justify-between text-slate-500">
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
                    ⏳ To be Confirmed
                  </span>
                )}
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-slate-900 uppercase">
                  {isPickup || deliveryConfirmed ? "Grand Total:" : "Order Value:"}
                </span>
                <div className="text-right">
                  <span className="text-lg text-[#6D3FD6] font-display">
                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </span>
                  {isDelivery && !deliveryConfirmed && (
                    <div className="text-[9px] text-amber-600 font-medium">
                      + delivery charge
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Download JPEG */}
            <button
              id="download-order-summary-btn"
              type="button"
              onClick={() => generateJPEG()}
              disabled={isGeneratingImage}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-purple-400"
            >
              {isGeneratingImage
                ? "⌛ Generating JPEG..."
                : `📥 Download Order Summary (JPEG)`}
            </button>

            {/* WhatsApp Share */}
            <button
              id="whatsapp-share-btn"
              type="button"
              onClick={() => openWhatsApp()}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00B761] hover:bg-[#009E53] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-emerald-500"
            >
              💬 Send Order Summary to Admin
            </button>

            {/* Back to Home */}
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              🏠 Back to Home
            </Link>
          </div>

          {/* Track order */}
          <div className="text-center text-[11px] text-slate-500 space-y-1">
            <p>
              Track your order at{" "}
              <Link
                href="/track-order"
                className="text-[#6D3FD6] hover:underline font-bold"
              >
                Track My Order →
              </Link>
            </p>
            <p>
              Your Order ID:{" "}
              <strong className="text-slate-900 font-mono">{formattedId}</strong>
            </p>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
