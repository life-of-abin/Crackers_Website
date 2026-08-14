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
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} />

      <div className="bg-[#11152E] text-[#FFF9EA] py-8 border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#F5C451] text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Order Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFF9EA] font-display">
            Track Guest Order Status
          </h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        
        {/* Lookup Form */}
        <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2 border-b border-[#292E4D] pb-4">
            <div className="text-4xl">🔎</div>
            <h2 className="text-lg font-black text-[#FFF9EA] font-display">Look Up Your Order</h2>
            <p className="text-xs text-[#B9B8C7]">Enter your Order Number and Mobile Number used at checkout.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-[#11152E] border border-rose-500/40 text-rose-400 text-xs font-bold rounded-xl flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-rose-400">✕</button>
            </div>
          )}

          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
                Order Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. #ORD-10024 or 24"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/30 focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/30 focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 gold-glow"
              >
                {loading ? "Searching Order..." : "Search Order Details →"}
              </button>
            </div>
          </form>
        </div>

        {/* Order Details Result Card */}
        {orderResult && (
          <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#292E4D] pb-4">
              <div>
                <span className="text-[10px] text-[#B9B8C7] font-extrabold uppercase tracking-wider block">Order ID</span>
                <span className="text-xl font-black text-[#FFF9EA] font-mono">#ORD-{10000 + orderResult.id}</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-[#11152E] border border-[#4ADE80]/30 text-[#4ADE80] text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {orderResult.paymentStatus}
                </span>
                <span className="bg-[#11152E] border border-[#F5C451]/30 text-[#F5C451] text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  {orderResult.orderStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
                <span className="text-[10px] font-bold text-[#B9B8C7] uppercase block">Delivery Address</span>
                <p className="font-extrabold text-[#FFF9EA]">{orderResult.customerName} ({orderResult.phone})</p>
                <p className="text-[#B9B8C7]">{orderResult.address}, {orderResult.city}, {orderResult.state} - {orderResult.pincode}</p>
              </div>

              <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
                <span className="text-[10px] font-bold text-[#B9B8C7] uppercase block">Payment Summary</span>
                <p className="text-[#B9B8C7]">Subtotal: ₹{Number(orderResult.subtotal).toLocaleString("en-IN")}</p>
                <p className="text-[#B9B8C7]">Shipping: ₹{Number(orderResult.shipping).toLocaleString("en-IN")}</p>
                <p className="font-black text-[#F5C451] text-sm">Total Paid: ₹{Number(orderResult.totalAmount).toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border border-[#292E4D] rounded-2xl overflow-hidden divide-y divide-[#292E4D] text-xs">
              <div className="bg-[#11152E] px-4 py-2 font-bold text-[#B9B8C7] flex justify-between text-[11px] uppercase">
                <span>Purchased Item</span>
                <span>Qty x Price</span>
              </div>
              {orderResult.items.map((item: any) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between bg-[#151A35]">
                  <span className="font-bold text-[#FFF9EA]">{item.productName}</span>
                  <span className="font-extrabold text-[#F5C451]">{item.quantity} x ₹{Number(item.price)}</span>
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
