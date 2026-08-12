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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={{
        id: 1,
        storeName: "Sri Sivakasi Crackers",
        phone: "+91 98765 43210",
        email: "support@sivasakthicrackers.com",
        address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
        googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
        whatsappNumber: "+919876543210",
        minOrderAmount: 500,
        flatShippingFee: 100,
        freeShippingThreshold: 3000,
      }} />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Track Guest Order Status
          </h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        
        {/* Lookup Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2 border-b border-slate-100 pb-4">
            <div className="text-4xl">🔎</div>
            <h2 className="text-lg font-black text-slate-900">Look Up Your Order</h2>
            <p className="text-xs text-slate-500">Enter your Order Number and Mobile Number used at checkout.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-red-500">✕</button>
            </div>
          )}

          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Order Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. #ORD-10024 or 24"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:from-red-700 hover:to-amber-700 transition-all disabled:opacity-50"
              >
                {loading ? "Searching Order..." : "Search Order Details →"}
              </button>
            </div>
          </form>
        </div>

        {/* Order Details Result Card */}
        {orderResult && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Order ID</span>
                <span className="text-xl font-black text-slate-900">#ORD-{10000 + orderResult.id}</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {orderResult.paymentStatus}
                </span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {orderResult.orderStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Delivery Address</span>
                <p className="font-extrabold text-slate-900">{orderResult.customerName} ({orderResult.phone})</p>
                <p className="text-slate-600">{orderResult.address}, {orderResult.city}, {orderResult.state} - {orderResult.pincode}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment Summary</span>
                <p className="text-slate-600">Subtotal: ₹{Number(orderResult.subtotal).toLocaleString("en-IN")}</p>
                <p className="text-slate-600">Shipping: ₹{Number(orderResult.shipping).toLocaleString("en-IN")}</p>
                <p className="font-black text-red-700 text-sm">Total Paid: ₹{Number(orderResult.totalAmount).toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between text-[11px] uppercase">
                <span>Purchased Item</span>
                <span>Qty x Price</span>
              </div>
              {orderResult.items.map((item: any) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.productName}</span>
                  <span className="font-extrabold text-slate-900">{item.quantity} x ₹{Number(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer settings={{
        id: 1,
        storeName: "Sri Sivakasi Crackers",
        phone: "+91 98765 43210",
        email: "support@sivasakthicrackers.com",
        address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
        googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
        whatsappNumber: "+919876543210",
        minOrderAmount: 500,
        flatShippingFee: 100,
        freeShippingThreshold: 3000,
      }} />
    </div>
  );
}
