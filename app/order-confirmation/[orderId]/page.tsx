import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FireworksCanvas from "@/components/ui/FireworksCanvas";

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

  const paymentMethod = order.payments?.[0]?.paymentMethod || (order as any).paymentMethod || "ONLINE";
  const paymentStatus = order.paymentStatus || "PAID";
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPaid = paymentStatus.toUpperCase().includes("PAID") || paymentStatus.toUpperCase() === "CONFIRMED";

  return (
    <div className="min-h-screen bg-[#080B1A] text-[#FFF9EA] flex flex-col justify-between relative overflow-hidden">
      <Header settings={settings} />
      <FireworksCanvas durationSeconds={7} />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-1 w-full text-center z-10 space-y-6 sm:space-y-8">
        
        {/* Main Confirmation Card */}
        <div className="bg-[#151A35]/90 backdrop-blur-xl border border-[#6D3FD6]/50 p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6">
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#F5C451] to-[#6D3FD6] rounded-full text-4xl shadow-lg animate-bounce">
            🎉
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFE29A] via-[#F5C451] to-[#FFE29A] tracking-tight font-display uppercase">
            ORDER CONFIRMED!
          </h1>
          
          <p className="text-[#B9B8C7] text-xs sm:text-sm max-w-md mx-auto">
            Thank you for your order with <strong className="text-[#F5C451]">{settings.storeName}</strong>! Your festive cracker order has been successfully placed.
          </p>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Order Number
              </span>
              <span className="text-base sm:text-lg font-black text-[#FFF9EA] font-mono block truncate">{formattedId}</span>
            </div>

            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Order Date & Time
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#FFF9EA] block">{orderDate}</span>
            </div>

            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Payment Status / Mode
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${isPaid ? "bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40" : "bg-[#F5C451]/20 text-[#F5C451] border border-[#F5C451]/40"}`}>
                  {paymentStatus}
                </span>
                <span className="text-xs font-bold text-[#B9B8C7]">({paymentMethod})</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1.5">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Customer Details
              </span>
              <p className="font-extrabold text-[#FFF9EA] text-sm">{order.customerName}</p>
              <p className="text-[#B9B8C7]">Mobile: <strong className="text-[#FFE29A] font-mono">{order.phone}</strong></p>
              <p className="text-[#B9B8C7]">Email: <span className="text-[#FFF9EA]">{order.email || "N/A"}</span></p>
            </div>

            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1.5">
              <span className="text-[10px] text-[#F5C451] font-extrabold uppercase tracking-wider block">
                Delivery Address
              </span>
              <p className="font-extrabold text-[#FFF9EA]">{order.customerName}</p>
              <p className="text-[#B9B8C7] leading-relaxed">
                {order.address}{order.landmark ? `, Near ${order.landmark}` : ""}, {order.city}, {order.district ? `${order.district}, ` : ""}{order.state} - <strong className="text-[#FFF9EA] font-mono">{order.pincode}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Order Products Table */}
          <div className="bg-[#11152E] border border-[#292E4D] rounded-2xl overflow-hidden text-xs text-left">
            <div className="px-4 py-2.5 bg-[#080B1A] border-b border-[#292E4D] font-extrabold text-[#B9B8C7] uppercase tracking-wider flex justify-between">
              <span>Purchased Products ({order.items.length})</span>
              <span>Total</span>
            </div>
            <div className="divide-y divide-[#292E4D]">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#FFF9EA] block text-xs sm:text-sm">{item.productName}</span>
                    <span className="text-[11px] text-[#B9B8C7] block">
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
            <div className="p-4 bg-[#080B1A] border-t border-[#292E4D] space-y-2 text-xs">
              <div className="flex justify-between text-[#B9B8C7]">
                <span>Subtotal:</span>
                <span className="font-bold text-[#FFF9EA]">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-[#4ADE80]">
                  <span>Discount:</span>
                  <span>- ₹{Number(order.discount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-[#B9B8C7]">
                <span>Delivery Charges:</span>
                <span className={Number(order.shipping) === 0 ? "text-[#4ADE80] font-bold" : "font-bold text-[#FFF9EA]"}>
                  {Number(order.shipping) === 0 ? "FREE" : `₹${Number(order.shipping).toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="border-t border-[#292E4D] pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-[#FFF9EA] uppercase">Grand Total:</span>
                <span className="text-lg text-[#F5C451] font-display">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#292E4D] flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href={`/orders/${order.id}/invoice`}
              className="w-full sm:w-auto px-6 py-3 bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 gold-glow"
            >
              📄 View / Download Invoice
            </Link>

            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3 bg-[#11152E] hover:bg-[#151A35] text-[#FFF9EA] border border-[#292E4D] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
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
