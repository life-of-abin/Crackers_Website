import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) notFound();

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    }),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  // If this is a guest order, redirect to public order-confirmation page
  if (!order.userId) {
    redirect(`/order-confirmation/${order.id}`);
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Enforce access control: Owner or Admin only
  const isOwner = order.userId === session.userId;
  const isAdmin = session.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const statusSteps = ["PLACED", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "DELIVERED"];
  const currentStepIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} user={session} />

      <div className="bg-[#11152E] text-[#FFF9EA] py-8 border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#F5C451] text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/orders" className="hover:underline">Orders</Link>
            <span>/</span>
            <span>Order #{order.id}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-black text-[#FFF9EA] font-display">
              Order Status Tracking #{order.id}
            </h1>
            <Link
              href={`/orders/${order.id}/invoice`}
              className="inline-flex items-center justify-center px-4 py-2 border border-[#292E4D] bg-[#151A35] hover:border-[#F5C451]/50 text-[#FFF9EA] hover:text-[#F5C451] font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md"
            >
              📄 View / Print Invoice
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Fulfillment Tracker Bar */}
        <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-6 shadow-xl space-y-6">
          <h2 className="text-sm font-black text-[#FFF9EA] uppercase tracking-wider font-display">
            Order Lifecycle Progress
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            {statusSteps.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto transition-all ${
                      isCurrent
                        ? "bg-[#F5C451] text-[#080B1A] ring-4 ring-[#F5C451]/30 font-black scale-110"
                        : isPassed
                        ? "bg-[#4ADE80] text-[#080B1A]"
                        : "bg-[#11152E] text-[#B9B8C7] border border-[#292E4D]"
                    }`}
                  >
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`block text-[10px] font-extrabold uppercase ${
                      isCurrent ? "text-[#F5C451]" : isPassed ? "text-[#4ADE80]" : "text-[#B9B8C7]/50"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#292E4D] pb-4 gap-2">
            <div>
              <span className="text-xs text-[#B9B8C7] font-medium">Placed on: {new Date(order.createdAt).toLocaleString("en-IN")}</span>
              <h3 className="text-base font-extrabold text-[#FFF9EA]">Customer: {order.customerName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#11152E] border border-[#4ADE80]/30 text-[#4ADE80] font-black text-xs px-3 py-1 rounded-full uppercase">
                Payment: {order.paymentStatus}
              </span>
              <span className="bg-[#11152E] border border-[#F5C451]/30 text-[#F5C451] font-black text-xs px-3 py-1 rounded-full uppercase">
                Status: {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
              <span className="text-[10px] font-bold text-[#B9B8C7] uppercase block">Shipping Address</span>
              <p className="font-extrabold text-[#FFF9EA]">{order.customerName}</p>
              <p className="text-[#B9B8C7]">{order.address}</p>
              <p className="text-[#B9B8C7]">{order.city}, {order.state} - {order.pincode}</p>
              <p className="font-bold text-[#F5C451] pt-1">Phone: {order.phone}</p>
            </div>

            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D] space-y-1">
              <span className="text-[10px] font-bold text-[#B9B8C7] uppercase block">Payment Overview</span>
              <p className="text-[#B9B8C7]">Subtotal: ₹{Number(order.subtotal).toLocaleString("en-IN")}</p>
              <p className="text-[#B9B8C7]">Shipping: ₹{Number(order.shipping).toLocaleString("en-IN")}</p>
              <p className="font-black text-sm text-[#F5C451] pt-2 border-t border-[#292E4D] mt-2">
                Grand Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="border border-[#292E4D] rounded-2xl overflow-hidden divide-y divide-[#292E4D] text-xs">
            <div className="bg-[#11152E] px-4 py-2 font-bold text-[#B9B8C7] flex justify-between uppercase">
              <span>Item Description</span>
              <span>Qty x Price</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between bg-[#151A35]">
                <div>
                  <span className="font-bold text-[#FFF9EA] block">{item.productName}</span>
                  <span className="text-[10px] text-[#B9B8C7]">ID #{item.productId}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#FFF9EA] block">{item.quantity} x ₹{Number(item.price).toLocaleString("en-IN")}</span>
                  <span className="font-black text-[#F5C451]">₹{Number(item.total).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
