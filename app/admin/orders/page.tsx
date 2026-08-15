import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
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

  const statusOptions = ["ALL", "PLACED", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <AdminNav user={session}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-red-600 uppercase tracking-widest block">
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
              className={`px-4 py-2 rounded-xl border transition-colors whitespace-nowrap ${
                status === st
                  ? "bg-slate-900 text-white border-slate-900"
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
            <p className="text-xs text-slate-400 py-8 text-center">No orders found matching status "{status}".</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer & Phone</th>
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
                      <td className="py-3.5 font-black text-slate-900">#{ord.id}</td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-500">{ord.phone}</span>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        {ord.city}, {ord.pincode}
                      </td>
                      <td className="py-3.5 font-black text-red-700">
                        ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
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
                          {ord.paymentMethod && (
                            <span className="block text-[10px] font-bold text-slate-500">
                              {ord.paymentMethod}
                            </span>
                          )}
                          {ord.paymentId && (
                            <span className="block text-[9px] font-mono text-slate-400 truncate max-w-[120px]">
                              Ref: {ord.paymentId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-800">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg transition-colors"
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
