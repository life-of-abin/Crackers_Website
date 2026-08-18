import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../../AdminNav";
import AdminOrderUpdater from "./AdminOrderUpdater";

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const session = await requireAdmin();

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <AdminNav user={session}>
      <div className="max-w-4xl mx-auto space-y-6 selection:bg-[#6D3FD6] selection:text-white">
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-widest block">
              Fulfillment Operations
            </span>
            <h1 className="text-2xl font-black text-slate-900">Manage Order #{order.id}</h1>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl">
            ← Back to Orders
          </Link>
        </div>

        <AdminOrderUpdater
          order={{
            id: order.id,
            invoiceNumber: order.invoiceNumber,
            customerName: order.customerName,
            phone: order.phone,
            email: order.email,
            address: order.address,
            city: order.city,
            state: order.state,
            pincode: order.pincode,
            subtotal: Number(order.subtotal),
            shipping: Number(order.shipping),
            totalAmount: Number(order.totalAmount),
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            paymentId: order.paymentId,
            orderStatus: order.orderStatus,
            orderType: (order as any).orderType ?? "DELIVERY",
            deliveryCharge: Number((order as any).deliveryCharge ?? 0),
            deliveryConfirmed: (order as any).deliveryConfirmed ?? false,
            createdAt: order.createdAt.toISOString(),
            items: order.items.map((i) => ({
              id: i.id,
              productName: i.productName,
              quantity: i.quantity,
              price: Number(i.price),
              total: Number(i.total),
            })),
          }}
        />

      </div>
    </AdminNav>
  );
}
