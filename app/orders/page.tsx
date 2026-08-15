"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function OrdersLookupPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState<any>(null);

  const settings = {
    id: 1,
    storeName: "Sri Sivakasi Crackers",
    phone: "9629525907",
    email: "abinesh.ece2003@gmail.com",
    address: "Sivakasi, Tamil Nadu, India",
    googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
    whatsappNumber: "+919629525907",
    minOrderAmount: 500,
    flatShippingFee: 100,
    freeShippingThreshold: 3000,
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrderResult(null);

    const cleanId = orderId.replace(/[^0-9]/g, "");
    if (!cleanId) {
      setError("Please enter a valid numeric Order Number (e.g. 10024 or #ORD-10024).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/orders/lookup?id=${cleanId}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        setError(data.error || "Order not found. Please check your Order Number and Mobile Number.");
      } else {
        setOrderResult(data.order);
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to retrieve order details. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} />

      <div className="bg-white text-slate-900 py-8 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#6D3FD6] text-xs font-bold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Track Guest Order Status
          </h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">

        {/* Lookup Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2 border-b border-slate-200 pb-4">
            <div className="text-4xl">🔎</div>
            <h2 className="text-lg font-black text-slate-900 font-display">Look Up Your Order</h2>
            <p className="text-xs text-slate-500">Enter your Order Number and Mobile Number used at checkout.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-rose-700 cursor-pointer">✕</button>
            </div>
          )}

          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Order Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. #ORD-10024 or 24"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Searching Order..." : "Search Order Details →"}
              </button>
            </div>
          </form>
        </div>

        {/* Order Details Result Card */}
        {orderResult && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Order ID</span>
                <span className="text-xl font-black text-slate-900 font-mono">#ORD-{10000 + orderResult.id}</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {orderResult.paymentStatus}
                </span>
                <span className="bg-purple-50 border border-purple-200 text-[#6D3FD6] text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {orderResult.orderStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Delivery Address</span>
                <p className="font-extrabold text-slate-900">{orderResult.customerName} ({orderResult.phone})</p>
                <p className="text-slate-600">{orderResult.address}, {orderResult.city}, {orderResult.state} - {orderResult.pincode}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Payment Summary</span>
                <p className="text-slate-600">Subtotal: ₹{Number(orderResult.subtotal).toLocaleString("en-IN")}</p>
                <p className="text-slate-600">Shipping: ₹{Number(orderResult.shipping).toLocaleString("en-IN")}</p>
                <p className="font-black text-[#6D3FD6] text-sm">Total Paid: ₹{Number(orderResult.totalAmount).toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200 text-xs">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between text-[11px] uppercase">
                <span>Purchased Item</span>
                <span>Qty x Price</span>
              </div>
              {orderResult.items.map((item: any) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between bg-white">
                  <span className="font-bold text-slate-900">{item.productName}</span>
                  <span className="font-extrabold text-[#6D3FD6]">{item.quantity} x ₹{Number(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer settings={settings} />
    </div>
  );
}
