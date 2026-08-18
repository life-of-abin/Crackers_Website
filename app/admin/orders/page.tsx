import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";

interface AdminOrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const session = await requireAdmin();

  const { status = "ALL" } = await searchParams;

  const whereClause: any = {};
  if (status !== "ALL") {
    whereClause.orderStatus = status;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const statusOptions = ["ALL", "AWAITING_DELIVERY_CONFIRMATION", "PLACED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "READY_FOR_PICKUP", "DELIVERED", "COLLECTED", "CANCELLED"];

  return (
    <AdminNav user={session}>
      <div className="space-y-6 max-w-7xl mx-auto selection:bg-[#6D3FD6] selection:text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-widest block">
              Fulfillment Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Customer Orders ({orders.length})
            </h1>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
          {statusOptions.map((st) => (
            <Link
              key={st}
              href={`/admin/orders?status=${st}`}
              className={`px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap ${
                status === st
                  ? "bg-[#6D3FD6] text-white border-[#6D3FD6] shadow-sm shadow-purple-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center font-medium">No orders found matching status "{status}".</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer & Phone</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">City & Pincode</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Order Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="py-3.5 font-black text-[#6D3FD6]">#{ord.id}</td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-500">{ord.phone}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          (ord as any).orderType === "PICKUP"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-purple-100 text-purple-800 border border-purple-300"
                        }`}>
                          {(ord as any).orderType === "PICKUP" ? "🏪 Pickup" : "🚚 Delivery"}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        {ord.city}, {ord.pincode}
                      </td>
                      <td className="py-3.5 font-black text-slate-900">
                        ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            ord.paymentStatus === "PAID" || ord.paymentStatus === "TEST_PAID"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : ord.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : ord.paymentStatus === "CANCELLED"
                              ? "bg-slate-100 text-slate-600 border border-slate-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}>
                            {ord.paymentStatus === "TEST_PAID" ? "PAID" : ord.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                          ord.orderStatus === "AWAITING_DELIVERY_CONFIRMATION"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : ord.orderStatus === "DELIVERED" || ord.orderStatus === "COLLECTED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : ord.orderStatus === "CANCELLED"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}>
                          {ord.orderStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition-all shadow-xs inline-block"
                        >
                          Manage & Update →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminNav>
  );
}
