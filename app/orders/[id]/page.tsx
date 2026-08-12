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
  const settings = await getStoreSettings();
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const orderId = parseInt(id);
  if (isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) notFound();

  // Enforce access control: Owner or Admin only
  const isOwner = order.userId === session.userId;
  const isAdmin = session.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const statusSteps = ["PLACED", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "DELIVERED"];
  const currentStepIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} user={session} />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/orders">Orders</Link>
            <span>/</span>
            <span>Order #{order.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Order Status Tracking #{order.id}
          </h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Fulfillment Tracker Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
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
                        ? "bg-amber-400 text-slate-950 ring-4 ring-amber-100 font-black scale-110"
                        : isPassed
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`block text-[10px] font-extrabold uppercase ${
                      isCurrent ? "text-amber-700" : isPassed ? "text-slate-800" : "text-slate-400"
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
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <span className="text-xs text-slate-400 font-medium">Placed on: {new Date(order.createdAt).toLocaleString("en-IN")}</span>
              <h3 className="text-base font-extrabold text-slate-900">Customer: {order.customerName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full uppercase">
                Payment: {order.paymentStatus}
              </span>
              <span className="bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full uppercase">
                Status: {order.orderStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Shipping Address</span>
              <p className="font-extrabold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.address}</p>
              <p className="text-slate-600">{order.city}, {order.state} - {order.pincode}</p>
              <p className="font-bold text-slate-800 pt-1">Phone: {order.phone}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment Overview</span>
              <p className="text-slate-600">Subtotal: ₹{Number(order.subtotal).toLocaleString("en-IN")}</p>
              <p className="text-slate-600">Shipping: ₹{Number(order.shipping).toLocaleString("en-IN")}</p>
              <p className="font-black text-sm text-red-700 pt-2 border-t border-slate-200">
                Grand Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between">
              <span>Item Description</span>
              <span>Qty x Price</span>
            </div>
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{item.productName}</span>
                  <span className="text-[10px] text-slate-400">ID #{item.productId}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{item.quantity} x ₹{Number(item.price).toLocaleString("en-IN")}</span>
                  <span className="font-black text-red-700">₹{Number(item.total).toLocaleString("en-IN")}</span>
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
