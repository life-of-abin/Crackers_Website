import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FireworksCanvas from "@/components/ui/FireworksCanvas";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;
  const settings = await getStoreSettings();

  if (!orderId) {
    notFound();
  }

  const numericId = parseInt(orderId, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: numericId },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  const formattedOrderNo = `#ORD-${10000 + order.id}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative">
      {/* 2.5 to 3.5 Second Fireworks Celebration Canvas */}
      <FireworksCanvas durationSeconds={3.5} />

      <Header settings={settings} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full z-10">
        
        {/* Guest Order Confirmed Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-10 space-y-8 text-center">
          
          <div className="space-y-4 border-b border-slate-800 pb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 via-amber-500 to-red-700 text-white rounded-full flex items-center justify-center text-4xl mx-auto font-black shadow-lg animate-bounce">
              🎆
            </div>
            
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">
              Order Confirmed 🎉
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Thank You For Your Order!
            </h1>
            
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your fireworks order has been successfully placed and transmitted to our Sivakasi factory warehouse.
            </p>
          </div>

          {/* Key Order Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                Order Number
              </span>
              <span className="text-xl font-black text-white font-mono">{formattedOrderNo}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                Amount Paid
              </span>
              <span className="text-xl font-black text-red-500">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                Delivery Address
              </span>
              <p className="font-extrabold text-white text-xs">{order.customerName}</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                {order.address}{order.landmark ? `, Near ${order.landmark}` : ""}, {order.city}{order.district ? `, ${order.district}` : ""}, {order.state} - <strong className="text-white">{order.pincode}</strong>
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                Contact Details
              </span>
              <p className="text-xs text-slate-300">
                We'll contact you on: <strong className="text-amber-300 font-mono text-sm">{order.phone}</strong>
              </p>
              {order.email && (
                <p className="text-xs text-slate-400">
                  Email updates sent to: <span className="text-slate-200">{order.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800 text-left">
            <div className="bg-slate-950 px-4 py-2.5 font-bold text-amber-400 flex justify-between text-xs uppercase tracking-wider">
              <span>Item Description</span>
              <span>Qty x Price</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{item.productName}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-400 block">{item.quantity} x ₹{Number(item.price).toLocaleString("en-IN")}</span>
                  <span className="font-black text-amber-400">₹{Number(item.total).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/products"
              className="inline-block w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all"
            >
              Continue Shopping →
            </Link>
          </div>

        </div>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
