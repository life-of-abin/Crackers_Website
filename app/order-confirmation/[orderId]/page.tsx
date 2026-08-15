import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FireworksCanvas from "@/components/ui/FireworksCanvas";
import RocketAnimation from "@/components/ui/RocketAnimation";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const numericId = parseInt(orderId, 10);
  if (isNaN(numericId)) notFound();

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: numericId },
      include: { items: true, payments: true },
    }),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  const formattedId = order.invoiceNumber
    ? order.invoiceNumber
    : `#ORD-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(6, "0")}`;

  const paymentMethod = order.paymentMethod || order.payments?.[0]?.paymentMethod || "UPI / Online Payment";
  const paymentStatus = order.paymentStatus || "PENDING";
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPaid = paymentStatus.toUpperCase() === "PAID" || paymentStatus.toUpperCase() === "TEST_PAID" || paymentStatus.toUpperCase() === "SUCCESS";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <Header settings={settings} />
      <FireworksCanvas durationSeconds={7} />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full text-center z-10 space-y-6 sm:space-y-8">
        
        {/* Main Confirmation Card */}
        <div className="bg-white border border-purple-200 p-6 sm:p-10 rounded-3xl shadow-xl space-y-6 relative">
          
          {/* Rocket & Firework Burst Animation */}
          <RocketAnimation />

          <h1 className="text-3xl sm:text-4xl font-black text-[#6D3FD6] tracking-tight font-display uppercase">
            {isPaid ? "ORDER CONFIRMED! 🎉" : "PAYMENT PENDING VERIFICATION"}
          </h1>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
            Thank you for your order with <strong className="text-[#6D3FD6]">{settings.storeName}</strong>! Your festive cracker order has been successfully placed.
          </p>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Order Number
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 font-mono block truncate">{formattedId}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Order Date & Time
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">{orderDate}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Payment Status / Mode
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${isPaid ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"}`}>
                  {paymentStatus}
                </span>
                <span className="text-xs font-bold text-slate-600">({paymentMethod})</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Customer Details
              </span>
              <p className="font-extrabold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-600">Mobile: <strong className="text-slate-900 font-mono">{order.phone}</strong></p>
              <p className="text-slate-600">Email: <span className="text-slate-900">{order.email || "N/A"}</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] text-[#6D3FD6] font-extrabold uppercase tracking-wider block">
                Delivery Address
              </span>
              <p className="font-extrabold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 leading-relaxed">
                {order.address}{order.landmark ? `, Near ${order.landmark}` : ""}, {order.city}, {order.district ? `${order.district}, ` : ""}{order.state} - <strong className="text-slate-900 font-mono">{order.pincode}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Order Products Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs text-left shadow-xs">
            <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 font-extrabold text-slate-700 uppercase tracking-wider flex justify-between">
              <span>Purchased Products ({order.items.length})</span>
              <span>Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">{item.productName}</span>
                    <span className="text-[11px] text-slate-500 block">
                      Qty: <strong className="text-[#6D3FD6]">{item.quantity}</strong> {item.unitType || "BOX"}{item.quantity > 1 ? "ES" : ""} × ₹{Number(item.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="font-black text-[#6D3FD6] text-xs sm:text-sm font-mono flex-shrink-0">
                    ₹{Number(item.total).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Totals Summary */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>- ₹{Number(order.discount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charges:</span>
                <span className={Number(order.shipping) === 0 ? "text-emerald-600 font-bold" : "font-bold text-slate-900"}>
                  {Number(order.shipping) === 0 ? "FREE" : `₹${Number(order.shipping).toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-slate-900 uppercase">Grand Total:</span>
                <span className="text-lg text-[#6D3FD6] font-display">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {isPaid ? (
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                📥 Download Invoice (PDF)
              </a>
            ) : (
              <div className="text-xs text-amber-900 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                Invoice available after payment confirmation.
              </div>
            )}

            <Link
              href={`/orders?query=${encodeURIComponent(order.phone)}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#6D3FD6] border border-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              📦 Track Order
            </Link>

            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
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
