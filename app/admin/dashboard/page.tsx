import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch real-time dashboard metrics from PostgreSQL
  const [
    totalOrdersCount,
    pendingOrdersCount,
    completedOrdersCount,
    revenueAgg,
    totalProductsCount,
    totalCategoriesCount,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: { in: ["PLACED", "CONFIRMED", "PROCESSING"] } } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.category.count({ where: { active: true } }),
    prisma.product.findMany({
      where: { stock: { lte: 20 }, active: true },
      take: 5,
      orderBy: { stock: "asc" },
    }),
    prisma.product.count({ where: { stock: 0, active: true } }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.product.findMany({
      where: { active: true },
      take: 5,
      orderBy: { purchases: "desc" },
      include: { category: true },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);

  return (
    <AdminNav user={session}>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-red-600 uppercase tracking-widest block">
              Overview & Real-time Metrics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Store Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products/new"
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <span>➕ Add New Product</span>
            </Link>
            <Link
              href="/admin/categories"
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              📁 Manage Categories
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Sales Revenue
            </span>
            <span className="text-2xl font-black text-red-700 block">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold">Verified Paid Orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {totalOrdersCount}
            </span>
            <span className="text-[11px] text-amber-600 font-bold">
              {pendingOrdersCount} Pending Fulfillment
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Active Catalogue
            </span>
            <span className="text-2xl font-black text-slate-900 block">
              {totalProductsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Across {totalCategoriesCount} Categories
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Inventory Alerts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">
                {lowStockProducts.length}
              </span>
              <span className="text-xs text-red-600 font-bold">
                ({outOfStockProducts} Sold Out)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Low Stock (&le; 20 units)</span>
          </div>

        </div>

        {/* Orders & Inventory Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders Table (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📦</span> Recent Customer Orders
              </h2>
              <Link href="/admin/orders" className="text-xs font-bold text-red-600 hover:underline">
                View All ({totalOrdersCount}) →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No orders created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase">
                      <th className="pb-2">Order ID</th>
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Payment</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-3 font-black text-slate-900">#{ord.id}</td>
                        <td className="py-3">
                          <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                          <span className="text-[10px] text-slate-400">{ord.phone}</span>
                        </td>
                        <td className="py-3 font-extrabold text-red-700">₹{Number(ord.totalAmount).toLocaleString("en-IN")}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            ord.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-800">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/admin/orders/${ord.id}`} className="text-xs font-bold text-red-600 hover:underline">
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Alerts & Quick Actions (1 col) */}
          <div className="space-y-6">
            
            {/* Low Stock Alerts */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <span>⚠️</span> Low Stock Warnings
              </h2>

              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-emerald-600 font-semibold py-2">✓ All items are sufficiently stocked.</p>
              ) : (
                <div className="space-y-3 text-xs">
                  {lowStockProducts.map((prod) => (
                    <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                      <div>
                        <span className="font-bold text-slate-900 line-clamp-1">{prod.name}</span>
                        <span className="text-[10px] text-slate-500">₹{Number(prod.price)}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-xs block ${prod.stock === 0 ? "text-red-600" : "text-amber-700"}`}>
                          {prod.stock === 0 ? "OUT OF STOCK" : `${prod.stock} Left`}
                        </span>
                        <Link href={`/admin/products/${prod.id}`} className="text-[10px] font-bold text-red-700 hover:underline">
                          Restock →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Selling Products */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <span>🔥</span> Top Performing Products
              </h2>

              <div className="space-y-2.5 text-xs">
                {topProducts.map((top) => (
                  <div key={top.id} className="flex items-center justify-between text-slate-700">
                    <span className="font-bold text-slate-900 line-clamp-1">{top.name}</span>
                    <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                      {top.purchases} Sold
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminNav>
  );
}
