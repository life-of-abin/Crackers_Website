import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import AdminNav from "../../AdminNav";
import AdminOrderUpdater from "./AdminOrderUpdater";

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const session = await requireAdmin();
  const settings = await getStoreSettings();

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: { stock: true },
          },
        },
      },
    },
  });

  if (!order) notFound();

  // Fetch raw item confirmation states directly from DB to prevent cached Prisma client defaults
  const rawOrderItems: any[] = await prisma.$queryRaw`
    SELECT id, "isConfirmed", "removedAt" FROM "OrderItem" WHERE "orderId" = ${orderId}
  `;

  const rawItemMap = new Map<number, { isConfirmed: boolean; removedAt: string | null }>();
  for (const rawItem of rawOrderItems) {
    rawItemMap.set(Number(rawItem.id), {
      isConfirmed: rawItem.isConfirmed === true || rawItem.isConfirmed === 1 || rawItem.isConfirmed === "t",
      removedAt: rawItem.removedAt ? new Date(rawItem.removedAt).toISOString() : null,
    });
  }

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
          minOrderAmount={settings.minOrderAmount || 500}
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
            items: order.items.map((i: any) => {
              const rawInfo = rawItemMap.get(i.id);
              const isConfirmed = rawInfo ? rawInfo.isConfirmed : ((i as any).isConfirmed !== false);
              const removedAt = rawInfo ? rawInfo.removedAt : ((i as any).removedAt ? new Date((i as any).removedAt).toISOString() : null);

              const stockRemaining = i.product ? Number(i.product.stock) : 0;
              const maxQuantity = i.quantity + stockRemaining;

              return {
                id: i.id,
                productName: i.productName,
                quantity: i.quantity,
                price: Number(i.price),
                total: Number(i.total),
                isConfirmed,
                removedAt,
                productStock: stockRemaining,
                maxQuantity,
              };
            }),
          }}
        />

      </div>
    </AdminNav>
  );
}
