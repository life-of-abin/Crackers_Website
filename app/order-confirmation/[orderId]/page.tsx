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

  const paymentMethodNames: Record<string, string> = {
    GPAY: "Google Pay",
    PHONEPE: "PhonePe",
    PAYTM: "Paytm",
    BHIM: "BHIM",
    UPI_QR: "Paytm / UPI QR",
    QR: "Paytm / UPI QR",
  };

  const rawMethod = order.paymentMethod || order.payments?.[0]?.paymentMethod || "UPI_QR";
  const displayPaymentMethod = paymentMethodNames[rawMethod] || rawMethod;

  const paymentStatus = order.paymentStatus || "PAID";
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPaid = paymentStatus.toUpperCase() === "PAID" || paymentStatus.toUpperCase() === "TEST_PAID" || paymentStatus.toUpperCase() === "SUCCESS";

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex flex-col justify-between relative overflow-hidden selection:bg-[#6D3FD6] selection:text-white">
      <Header settings={settings} />
      <FireworksCanvas durationSeconds={7} />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full text-center z-10 space-y-6 sm:space-y-8">
        
        {/* Main Dark Confirmation Card */}
        <div className="bg-[#151A35]/95 border border-[#6D3FD6]/40 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6 relative backdrop-blur-md">
          
          {/* Rocket Launch & Fireworks Celebration Animation */}
          <RocketAnimation />

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F5C451] tracking-tight font-display uppercase">
              ORDER CONFIRMED! 🎉
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
              Your payment was successful and your order has been confirmed with <strong className="text-white">{settings.storeName}</strong>.
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

            {/* Payment Status & Method */}
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Payment Status & Method
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                  ✓ {paymentStatus}
                </span>
                <span className="text-xs font-bold text-slate-300">({displayPaymentMethod})</span>
              </div>
            </div>

            {/* Order Total & Date */}
            <div className="bg-[#080B1A]/80 p-4 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Order Total & Date
              </span>
              <div className="text-xs sm:text-sm font-bold text-white block">
                ₹{Number(order.totalAmount).toLocaleString("en-IN")} • <span className="text-slate-400 text-[11px]">{orderDate}</span>
              </div>
            </div>

          </div>

          {/* Customer Name & Delivery Address */}
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
                Delivery Address
              </span>
              <p className="font-extrabold text-white">{order.customerName}</p>
              <p className="text-slate-300 leading-relaxed">
                {order.address}{order.landmark ? `, Near ${order.landmark}` : ""}, {order.city}, {order.district ? `${order.district}, ` : ""}{order.state} - <strong className="text-white font-mono">{order.pincode}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Order Products Table */}
          <div className="bg-[#080B1A]/90 border border-white/10 rounded-2xl overflow-hidden text-xs text-left shadow-lg">
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 font-extrabold text-[#F5C451] uppercase tracking-wider flex justify-between">
              <span>Purchased Products ({order.items.length})</span>
              <span>Total</span>
            </div>
            <div className="divide-y divide-white/10">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block text-xs sm:text-sm">{item.productName}</span>
                    <span className="text-[11px] text-slate-400 block">
                      Qty: <strong className="text-[#F5C451]">{item.quantity}</strong> {item.unitType || "BOX"}{item.quantity > 1 ? "ES" : ""} × ₹{Number(item.price).toLocaleString("en-IN")}
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
                <span>Subtotal:</span>
                <span className="font-bold text-white">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount:</span>
                  <span>- ₹{Number(order.discount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Delivery Charges:</span>
                <span className={Number(order.shipping) === 0 ? "text-emerald-400 font-bold" : "font-bold text-white"}>
                  {Number(order.shipping) === 0 ? "FREE" : `₹${Number(order.shipping).toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-white uppercase">Grand Total:</span>
                <span className="text-lg text-[#F5C451] font-display">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href={`/api/orders/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-purple-950/40"
            >
              📥 Download Invoice (PDF)
            </a>

            <Link
              href={`/orders?query=${encodeURIComponent(order.phone)}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-[#F5C451] border border-white/20 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              📦 Track Order
            </Link>

            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
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
