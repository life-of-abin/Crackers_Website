"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { isValidGmailFormat } from "@/lib/pincode";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export interface StoreSettings {
  id: number;
  storeName: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  whatsappNumber: string;
  minOrderAmount: number;
  flatShippingFee: number;
  freeShippingThreshold: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  storeName: "Sri Sivakasi Crackers",
  phone: "9629525907",
  email: "abinesh.ece200@gmail.com",
  address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
  googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
  whatsappNumber: "+919629525907",
  minOrderAmount: 500,
  flatShippingFee: 100,
  freeShippingThreshold: 3000,
};

const ORDER_STEPS = [
  { key: "PLACED", label: "Order Placed", icon: "📝" },
  { key: "CONFIRMED", label: "Payment Confirmed", icon: "✓" },
  { key: "PROCESSING", label: "Processing", icon: "⚙️" },
  { key: "PACKED", label: "Packed", icon: "📦" },
  { key: "SHIPPED", label: "Shipped", icon: "🚚" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "🛵" },
  { key: "DELIVERED", label: "Delivered", icon: "🎉" },
];

export default function TrackOrderPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error);
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setOrder(null);

    const cleanOrderId = orderId.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanOrderId) {
      setError("Please enter your Order ID.");
      return;
    }

    if (!cleanEmail || !isValidGmailFormat(cleanEmail)) {
      setEmailError("Please enter a valid Gmail address ending with @gmail.com.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cleanOrderId, email: cleanEmail }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        setError(data.error || "Order details could not be found. Please check your Order ID and Gmail address.");
      } else {
        setOrder(data.order);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to tracking server. Please check your network and try again.");
    }
  };

  const getActiveStepIndex = (status: string, paymentStatus: string): number => {
    const s = (status || "").toUpperCase();
    const p = (paymentStatus || "").toUpperCase();

    if (s === "DELIVERED") return 6;
    if (s === "OUT_FOR_DELIVERY") return 5;
    if (s === "SHIPPED") return 4;
    if (s === "PACKED") return 3;
    if (s === "PROCESSING" || s === "READY") return 2;
    if (s === "CONFIRMED" || p === "PAID" || p === "COMPLETED") return 1;
    return 0;
  };

  const activeIndex = order ? getActiveStepIndex(order.orderStatus, order.paymentStatus) : 0;
  const isCancelled = order?.orderStatus?.toUpperCase() === "CANCELLED";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} />

      {/* Hero Banner */}
      <div className="bg-white py-10 border-b border-slate-200 text-center shadow-xs">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-[#6D3FD6] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
            <span>📦 REAL-TIME ORDER TRACKING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            Track Your Cracker Delivery
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Enter your Order ID and Gmail address below to view current dispatch status and delivery details.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        
        {/* Tracking Search Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-5">
          <form onSubmit={handleTrackSubmit} className="space-y-4" noValidate>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Order ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORD-2026-000123 or 123"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Found in your order confirmation screen or invoice
                </span>
              </div>

              {/* Gmail Address Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Gmail Address (@gmail.com) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="abinesh@gmail.com"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase();
                    setEmail(val);
                    if (!val || val.trim().length === 0) {
                      setEmailError("Please enter your Gmail address (lowercase only).");
                    } else if (!isValidGmailFormat(val)) {
                      setEmailError("Please enter a valid Gmail address ending with @gmail.com.");
                    } else {
                      setEmailError("");
                    }
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    emailError ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:ring-[#6D3FD6]"
                  }`}
                />
                {emailError ? (
                  <span className="text-[11px] font-bold text-red-600 mt-1 block">
                    ⚠️ {emailError}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Must end with @gmail.com (lowercase only)
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button type="button" onClick={() => setError("")} className="text-red-700 hover:text-black font-extrabold cursor-pointer">✕</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Searching Database...</span>
                </>
              ) : (
                <span>Track Order Status →</span>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results Card */}
        {order && (
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-8 animate-fadeIn">
            
            {/* Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-widest block">
                  ORDER DETAILS
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-mono">{order.formattedId}</h2>
                <span className="text-xs text-slate-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                  isCancelled
                    ? "bg-red-50 text-red-700 border-red-200"
                    : order.orderStatus === "DELIVERED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-purple-50 text-[#6D3FD6] border-purple-200"
                }`}>
                  Status: {order.orderStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            {isCancelled ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
                <span className="text-3xl block">🚫</span>
                <h3 className="text-base font-black text-red-700 uppercase font-display">This Order Has Been Cancelled</h3>
                <p className="text-xs text-slate-600">If you have any questions regarding refunds or cancellation details, please contact customer support.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#6D3FD6] uppercase tracking-widest font-display">
                    Live Real-Time Dispatch Stepper
                  </h3>
                  {order.paymentStatus === "PAID" && (
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                      ✓ Payment Verified (PAID)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
                  {ORDER_STEPS.map((step, idx) => {
                    const isPaymentStep = step.key === "CONFIRMED";
                    const isDeliveredStep = step.key === "DELIVERED";
                    const isPaid = order.paymentStatus === "PAID";
                    
                    const isCompleted = isPaymentStep ? (isPaid || idx <= activeIndex) : (idx <= activeIndex);
                    const isCurrent = idx === activeIndex;

                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                          isCurrent
                            ? "bg-purple-50 border-[#6D3FD6] text-[#6D3FD6] ring-2 ring-[#6D3FD6]/40 font-bold shadow-sm"
                            : isCompleted
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <span className="text-lg mb-1">{step.icon}</span>
                        <span className="text-[10px] font-extrabold leading-tight">{step.label}</span>
                        {isPaymentStep ? (
                          isPaid ? (
                            <span className="text-[9px] text-emerald-700 font-black mt-1 bg-emerald-100 px-1.5 py-0.5 rounded">
                              ✓ Paid
                            </span>
                          ) : (
                            <span className="text-[9px] text-amber-700 font-bold mt-1">
                              ⏳ Pending
                            </span>
                          )
                        ) : isDeliveredStep && isCompleted ? (
                          <span className="text-[9px] text-emerald-700 font-black mt-1">
                            🎉 Handed Over
                          </span>
                        ) : isCompleted ? (
                          <span className="text-[9px] text-emerald-700 font-bold mt-1">✓ Done</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items Summary Table */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-display">
                Purchased Cracker Items ({order.items.length})
              </h3>

              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200 p-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-900 text-sm">{item.productName}</p>
                      <p className="text-[11px] text-[#6D3FD6] font-medium">
                        Pack Size: <strong>{item.packSize || "10 Pieces"} / {item.unitType || "BOX"}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Quantity: <strong className="text-slate-900">{item.quantity} {item.unitType || "BOX"}(ES)</strong> × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-black text-[#6D3FD6] font-mono text-sm">
                      ₹{Number(item.total).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <p className="font-extrabold text-slate-900 text-xs">{order.customerName}</p>
                <p className="text-slate-600 text-xs">
                  {order.city}, {order.district}, {order.state} - <strong className="text-slate-900">{order.pincode}</strong>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                  Payment Summary
                </span>
                <p className="text-xs text-slate-600">
                  Status: <strong className="text-emerald-700">{order.paymentStatus}</strong>
                </p>
                <p className="text-sm font-black text-[#6D3FD6]">
                  Total Paid: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Invoice PDF Download Link */}
            <div className="pt-4 border-t border-slate-200 flex justify-center">
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>📄 Download Official PDF Invoice</span>
              </a>
            </div>

          </div>
        )}

      </main>

      <Footer settings={settings} />
    </div>
  );
}
