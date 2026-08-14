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

  const getActiveStepIndex = (status: string): number => {
    const s = (status || "").toUpperCase();
    if (s === "DELIVERED") return 6;
    if (s === "OUT_FOR_DELIVERY") return 5;
    if (s === "SHIPPED") return 4;
    if (s === "PACKED") return 3;
    if (s === "PROCESSING") return 2;
    if (s === "CONFIRMED" || s === "PAID") return 1;
    return 0;
  };

  const activeIndex = order ? getActiveStepIndex(order.orderStatus) : 0;
  const isCancelled = order?.orderStatus?.toUpperCase() === "CANCELLED";

  return (
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} />

      {/* Hero Banner */}
      <div className="bg-[#11152E] py-10 border-b border-[#292E4D] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#6D3FD6]/20 border border-[#6D3FD6]/40 text-[#FFE29A] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
            <span>📦 REAL-TIME ORDER TRACKING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#FFF9EA] tracking-tight font-display">
            Track Your Cracker Delivery
          </h1>
          <p className="text-[#B9B8C7] text-xs sm:text-sm max-w-md mx-auto">
            Enter your Order ID and Gmail address below to view current dispatch status and delivery details.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        
        {/* Tracking Search Card */}
        <div className="bg-[#151A35] border border-[#292E4D] p-6 sm:p-8 rounded-3xl shadow-xl space-y-5">
          <form onSubmit={handleTrackSubmit} className="space-y-4" noValidate>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order ID Input */}
              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1.5">
                  Order ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORD-2026-000123 or 123"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-mono font-bold text-[#FFF9EA] placeholder-[#B9B8C7]/30 focus:outline-none focus:ring-2 focus:ring-[#F5C451] transition-all"
                />
                <span className="text-[10px] text-[#B9B8C7]/60 mt-1 block">
                  Found in your order confirmation screen or invoice
                </span>
              </div>

              {/* Gmail Address Input */}
              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1.5">
                  Gmail Address (@gmail.com) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="abinesh@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={`w-full px-4 py-3 bg-[#11152E] border rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/30 focus:outline-none focus:ring-2 transition-all ${
                    emailError ? "border-rose-500 ring-1 ring-rose-500" : "border-[#292E4D] focus:ring-[#F5C451]"
                  }`}
                />
                {emailError ? (
                  <span className="text-[11px] font-bold text-rose-400 mt-1 block">
                    ⚠️ {emailError}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#B9B8C7]/60 mt-1 block">
                    Must end with @gmail.com
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-[#11152E] border border-rose-500/40 text-rose-400 text-xs font-bold rounded-2xl flex items-center justify-between">
                <span>⚠️ {error}</span>
                <button type="button" onClick={() => setError("")} className="text-rose-400 hover:text-white font-extrabold">✕</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 gold-glow"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[#080B1A] border-t-transparent animate-spin" />
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
          <div className="bg-[#151A35] border border-[#292E4D] p-6 sm:p-8 rounded-3xl shadow-xl space-y-8 animate-fadeIn">
            
            {/* Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#292E4D]">
              <div>
                <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-widest block">
                  ORDER DETAILS
                </span>
                <h2 className="text-2xl font-black text-[#FFF9EA] font-mono">{order.formattedId}</h2>
                <span className="text-xs text-[#B9B8C7]">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                  isCancelled
                    ? "bg-[#11152E] text-rose-400 border-rose-800"
                    : order.orderStatus === "DELIVERED"
                    ? "bg-[#11152E] text-[#4ADE80] border-[#4ADE80]/30"
                    : "bg-[#11152E] text-[#F5C451] border-[#F5C451]/30"
                }`}>
                  Status: {order.orderStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            {isCancelled ? (
              <div className="p-6 bg-[#11152E] border border-rose-500/30 rounded-2xl text-center space-y-2">
                <span className="text-3xl block">🚫</span>
                <h3 className="text-base font-black text-rose-400 uppercase font-display">This Order Has Been Cancelled</h3>
                <p className="text-xs text-[#B9B8C7]">If you have any questions regarding refunds or cancellation details, please contact customer support.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-[#F5C451] uppercase tracking-widest font-display">
                  Live Dispatch Stepper
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
                  {ORDER_STEPS.map((step, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                          isCurrent
                            ? "bg-[#6D3FD6]/30 border-[#F5C451] text-[#F5C451] ring-2 ring-[#F5C451]/50"
                            : isCompleted
                            ? "bg-[#11152E] border-[#4ADE80]/40 text-[#4ADE80]"
                            : "bg-[#080B1A] border-[#292E4D] text-[#B9B8C7]/50"
                        }`}
                      >
                        <span className="text-lg mb-1">{step.icon}</span>
                        <span className="text-[10px] font-extrabold leading-tight">{step.label}</span>
                        {isCompleted && (
                          <span className="text-[9px] text-[#4ADE80] font-bold mt-1">✓ Done</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items Summary Table */}
            <div className="space-y-3 pt-4 border-t border-[#292E4D]">
              <h3 className="text-xs font-black text-[#B9B8C7] uppercase tracking-widest font-display">
                Purchased Cracker Items ({order.items.length})
              </h3>

              <div className="divide-y divide-[#292E4D] bg-[#080B1A] rounded-2xl border border-[#292E4D] p-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-[#FFF9EA] text-sm">{item.productName}</p>
                      <p className="text-[11px] text-[#F5C451] font-medium">
                        Pack Size: <strong>{item.packSize || "10 Pieces"} / {item.unitType || "BOX"}</strong>
                      </p>
                      <p className="text-[10px] text-[#B9B8C7]">
                        Quantity: <strong className="text-[#FFF9EA]">{item.quantity} {item.unitType || "BOX"}(ES)</strong> × ₹{item.price}
                      </p>
                    </div>
                    <span className="font-black text-[#F5C451] font-mono text-sm">
                      ₹{Number(item.total).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
                <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <p className="font-extrabold text-[#FFF9EA] text-xs">{order.customerName}</p>
                <p className="text-[#B9B8C7] text-xs">
                  {order.city}, {order.district}, {order.state} - <strong className="text-[#FFF9EA]">{order.pincode}</strong>
                </p>
              </div>

              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
                <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                  Payment Summary
                </span>
                <p className="text-xs text-[#B9B8C7]">
                  Status: <strong className="text-[#4ADE80]">{order.paymentStatus}</strong>
                </p>
                <p className="text-sm font-black text-[#F5C451]">
                  Total Paid: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Invoice PDF Download Link */}
            <div className="pt-4 border-t border-[#292E4D] flex justify-center">
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#6D3FD6] hover:bg-[#9B6DFF] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
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
