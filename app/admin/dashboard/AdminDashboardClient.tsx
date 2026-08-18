"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

import OfflineBillingModule, { POSProduct } from "./OfflineBillingModule";

export interface OrderItemData {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface DashboardOrder {
  id: number;
  customerName: string;
  phone: string;
  email: string | null;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: OrderItemData[];
}

export interface LowStockProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface CategorySales {
  id: number;
  name: string;
  ordersCount: number;
  totalPurchases: number;
}

export interface OfflineOrderRecord {
  id: number;
  offlineBillNumber: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  subtotal: number;
  discount: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItemData[];
}

export interface DashboardClientProps {
  totalRevenue: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  offlineOrdersCount: number;
  offlineRevenue: number;
  totalProductsCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inactiveCount: number;
  lowStockList: LowStockProduct[];
  recentOrders: DashboardOrder[];
  offlineOrdersHistory?: OfflineOrderRecord[];
  categorySales: CategorySales[];
  posProducts: POSProduct[];
}

export default function AdminDashboardClient({
  totalRevenue,
  totalOrdersCount,
  pendingOrdersCount,
  completedOrdersCount,
  offlineOrdersCount,
  offlineRevenue,
  totalProductsCount,
  inStockCount,
  lowStockCount,
  outOfStockCount,
  inactiveCount,
  lowStockList,
  recentOrders,
  offlineOrdersHistory = [],
  categorySales,
  posProducts,
}: DashboardClientProps) {
  // Mode Switch State: ONLINE vs OFFLINE POS
  const [activeMode, setActiveMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");

  // Date Range Filter State
  const [dateRange, setDateRange] = useState<string>("ALL"); // ALL, TODAY, YESTERDAY, 7DAYS, 30DAYS
  
  // Orders Filter Drawer State
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter Orders Dynamically
  const filteredOrders = useMemo(() => {
    return recentOrders.filter((ord) => {
      // Status Filter
      if (statusFilter !== "ALL" && ord.orderStatus.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
      // Payment Filter
      if (paymentFilter !== "ALL" && ord.paymentStatus.toUpperCase() !== paymentFilter.toUpperCase()) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = ord.customerName.toLowerCase().includes(query);
        const matchesId = ord.id.toString().includes(query);
        const matchesPhone = ord.phone.includes(query);
        if (!matchesName && !matchesId && !matchesPhone) return false;
      }
      // Date Filter
      if (dateRange !== "ALL") {
        const orderDate = new Date(ord.createdAt);
        const now = new Date();
        if (dateRange === "TODAY") {
          if (orderDate.toDateString() !== now.toDateString()) return false;
        } else if (dateRange === "YESTERDAY") {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          if (orderDate.toDateString() !== yesterday.toDateString()) return false;
        } else if (dateRange === "7DAYS") {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (orderDate < sevenDaysAgo) return false;
        } else if (dateRange === "30DAYS") {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (orderDate < thirtyDaysAgo) return false;
        } else if (dateRange === "YEARLY") {
          if (orderDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    });
  }, [recentOrders, statusFilter, paymentFilter, searchQuery, dateRange]);

  // Date-Filtered Online Orders & Revenue
  const dateFilteredOnlineOrders = useMemo(() => {
    return recentOrders.filter((ord) => {
      if (dateRange === "ALL") return true;
      const orderDate = new Date(ord.createdAt);
      const now = new Date();
      if (dateRange === "TODAY") return orderDate.toDateString() === now.toDateString();
      if (dateRange === "YESTERDAY") {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      }
      if (dateRange === "7DAYS") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }
      if (dateRange === "30DAYS") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      }
      if (dateRange === "YEARLY") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [recentOrders, dateRange]);

  const dateFilteredOnlineRevenue = useMemo(() => {
    return dateFilteredOnlineOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  }, [dateFilteredOnlineOrders]);

  // Date-Filtered Offline Orders & Revenue
  const dateFilteredOfflineOrders = useMemo(() => {
    return offlineOrdersHistory.filter((ord) => {
      if (dateRange === "ALL") return true;
      const orderDate = new Date(ord.createdAt);
      const now = new Date();
      if (dateRange === "TODAY") return orderDate.toDateString() === now.toDateString();
      if (dateRange === "YESTERDAY") {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      }
      if (dateRange === "7DAYS") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }
      if (dateRange === "30DAYS") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      }
      if (dateRange === "YEARLY") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [offlineOrdersHistory, dateRange]);

  const dateFilteredOfflineRevenue = useMemo(() => {
    return dateFilteredOfflineOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  }, [dateFilteredOfflineOrders]);

  // Combined Date-Filtered Metrics (Online + Offline)
  const combinedFilteredCount = dateFilteredOnlineOrders.length + dateFilteredOfflineOrders.length;
  const combinedFilteredRevenue = dateFilteredOnlineRevenue + dateFilteredOfflineRevenue;

  // Display metrics for Online mode KPI cards
  const displayOnlineRevenue = dateRange === "ALL" ? totalRevenue : dateFilteredOnlineRevenue;
  const displayOnlineOrdersCount = dateRange === "ALL" ? totalOrdersCount : dateFilteredOnlineOrders.length;

  // Donut Chart Data Calculations
  const donutTotal = Math.max(1, totalProductsCount + inactiveCount);
  const inStockPct = Math.round((inStockCount / donutTotal) * 100);
  const lowStockPct = Math.round((lowStockCount / donutTotal) * 100);
  const outOfStockPct = Math.round((outOfStockCount / donutTotal) * 100);
  const inactivePct = Math.round((inactiveCount / donutTotal) * 100);

  // Calculate SVG Donut strokeDasharray
  const circumference = 2 * Math.PI * 40; // radius = 40, C ~ 251.32
  const inStockStroke = (inStockCount / donutTotal) * circumference;
  const lowStockStroke = (lowStockCount / donutTotal) * circumference;
  const outOfStockStroke = (outOfStockCount / donutTotal) * circumference;
  const inactiveStroke = (inactiveCount / donutTotal) * circumference;

  const inStockOffset = 0;
  const lowStockOffset = -inStockStroke;
  const outOfStockOffset = -(inStockStroke + lowStockStroke);
  const inactiveOffset = -(inStockStroke + lowStockStroke + outOfStockStroke);

  return (
    <div className="space-y-8 max-w-7xl mx-auto selection:bg-[#6D3FD6] selection:text-white">
      
      {/* 9. Dashboard Header & Mode Switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base font-extrabold text-slate-600 mt-1">
            Real-time management for store sales & orders
          </p>
        </div>

        {/* Header Management Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          
          {/* Large Touch Segmented Control: ONLINE ORDERS vs OFFLINE BILLING */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-sm font-black shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode("ONLINE")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeMode === "ONLINE"
                  ? "bg-[#6D3FD6] text-white shadow-md shadow-purple-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🛒</span>
              <span>ONLINE ORDERS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("OFFLINE")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeMode === "OFFLINE"
                  ? "bg-[#6D3FD6] text-white shadow-md shadow-purple-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🧾</span>
              <span>OFFLINE BILLING</span>
            </button>
          </div>

          {/* Unified Date Range Selector Filter (Applies to both Online and Offline) */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 shadow-xs shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5 text-[#6D3FD6]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v7.5" />
            </svg>
            <span className="text-slate-500 font-extrabold">Date Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-black text-[#6D3FD6] text-sm focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
              <option value="YEARLY">This Year</option>
            </select>
          </div>
        </div>
      </div>



      {/* OFFLINE POS BILLING MODULE */}
      {activeMode === "OFFLINE" ? (
        <OfflineBillingModule products={posProducts} offlineOrders={offlineOrdersHistory} externalDateFilter={dateRange} />
      ) : (
        <>
          {/* 10. Dashboard KPI Cards (STRICTLY 5 CARDS IN EXACT ORDER) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. TOTAL SALES */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              TOTAL SALES
            </span>
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#6D3FD6] flex items-center justify-center text-sm font-black">
              💰
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block tracking-tight">
              ₹{displayOnlineRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <span>✓</span> Real Verified Sales ({dateRange})
            </span>
          </div>
        </div>

        {/* 2. TOTAL ORDERS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              TOTAL ORDERS
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">
              📦
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block tracking-tight">
              {displayOnlineOrdersCount}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
              Recorded Orders ({dateRange})
            </span>
          </div>
        </div>

        {/* 3. PENDING ORDERS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              PENDING ORDERS
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-black">
              ⏳
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600 block tracking-tight">
              {pendingOrdersCount}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
              In Processing / Fulfillment
            </span>
          </div>
        </div>

        {/* 4. COMPLETED ORDERS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              COMPLETED ORDERS
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black">
              ✅
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600 block tracking-tight">
              {completedOrdersCount}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
              Delivered Successfully
            </span>
          </div>
        </div>

        {/* 5. LOW STOCK ALERT */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              LOW STOCK ALERT
            </span>
            <span className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-sm font-black">
              ⚠️
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-red-600 block tracking-tight">
              {lowStockCount}
            </span>
            <span className="text-[11px] text-red-700 font-extrabold mt-0.5 block">
              {lowStockCount > 0 ? `${lowStockCount} Products Need Attention` : "✓ All items stocked"}
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: 12. ORDERS LIST + 15. STOCK OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ORDERS LIST (2 Columns - Fixed Height Pixel Aligned with Right Column Top Selling Categories) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[742px]">
          
          {/* Orders Header Bar + 13. Three-Line Filter Icon Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 shrink-0">
            <div>
              <h2 className="font-black text-base text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📦</span> ORDERS LIST
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredOrders.length} of {recentOrders.length} orders
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 13. Three-Line Filter Button */}
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                  filterOpen
                    ? "bg-[#6D3FD6] text-white border-[#6D3FD6] shadow-sm shadow-purple-200"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
                aria-label="Filter orders"
              >
                {/* Three-Line Filter Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <span>Filter</span>
                {(statusFilter !== "ALL" || paymentFilter !== "ALL" || searchQuery) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              <Link
                href="/admin/orders"
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
              >
                View All →
              </Link>
            </div>
          </div>

          {/* 14. ORDER FILTERS PANEL */}
          {filterOpen && (
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-4 my-3 shrink-0 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between text-xs font-black uppercase text-slate-700">
                <span>Filter Orders</span>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setPaymentFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="text-[#6D3FD6] hover:underline lowercase font-bold text-xs"
                >
                  Clear Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                {/* Search Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Search Customer / ID / Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Search name, phone, order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                  />
                </div>

                {/* Order Status Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Order Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] font-bold cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PLACED">Placed</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] font-bold cursor-pointer"
                  >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Internal Scrollable Orders Container */}
          <div className="flex-1 overflow-y-auto min-h-0 mt-3">
            {/* Desktop Table View */}
            <div className="hidden sm:block">
              {filteredOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center font-medium">
                  No matching orders found.
                </p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-white z-20 shadow-xs border-b border-slate-200">
                    <tr className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3 bg-white">Order ID</th>
                      <th className="py-3 px-3 bg-white">Customer</th>
                      <th className="py-3 px-3 bg-white">Date</th>
                      <th className="py-3 px-3 bg-white">Amount</th>
                      <th className="py-3 px-3 bg-white">Payment</th>
                      <th className="py-3 px-3 bg-white">Status</th>
                      <th className="py-3 px-3 bg-white text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-black text-[#6D3FD6]">#{ord.id}</td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                          <span className="text-[10px] text-slate-400">{ord.phone}</span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </td>
                        <td className="py-3.5 px-3 font-black text-slate-900">
                          ₹{ord.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            ord.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="text-xs font-bold text-[#6D3FD6] hover:underline"
                          >
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 20. Mobile Order Cards */}
            <div className="sm:hidden space-y-3">
              {filteredOrders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No orders found.</p>
              ) : (
                filteredOrders.map((ord) => (
                  <div key={ord.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#6D3FD6]">Order #{ord.id}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-500">{ord.phone}</span>
                      </div>
                      <span className="font-black text-sm text-slate-900">
                        ₹{ord.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          ord.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {ord.paymentStatus}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-200 text-slate-800">
                          {ord.orderStatus}
                        </span>
                      </div>

                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="text-xs font-black text-[#6D3FD6] hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: 15. STOCK OVERVIEW & 16. TOP SELLING CATEGORIES */}
        <div className="space-y-8">
          
          {/* 15. STOCK OVERVIEW (Donut Chart) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📊</span> STOCK OVERVIEW
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {totalProductsCount} Products
              </span>
            </div>

            {/* SVG Donut Chart */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                {/* In Stock - Green */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="14"
                  strokeDasharray={`${inStockStroke} ${circumference}`}
                  strokeDashoffset={inStockOffset}
                />
                {/* Low Stock - Orange */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray={`${lowStockStroke} ${circumference}`}
                  strokeDashoffset={lowStockOffset}
                />
                {/* Out of Stock - Red */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray={`${outOfStockStroke} ${circumference}`}
                  strokeDashoffset={outOfStockOffset}
                />
                {/* Inactive - Gray */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#9CA3AF"
                  strokeWidth="14"
                  strokeDasharray={`${inactiveStroke} ${circumference}`}
                  strokeDashoffset={inactiveOffset}
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{totalProductsCount}</span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Items</span>
              </div>
            </div>

            {/* Dynamic Stock Legend (Interactive Filter Buttons) */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold pt-2">
              <Link
                href="/admin/products?stockStatus=in_stock"
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all hover:scale-[1.02] cursor-pointer group"
                title="View In Stock products"
              >
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold group-hover:underline">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  In Stock
                </span>
                <span className="font-black text-emerald-950 bg-emerald-200/60 px-2 py-0.5 rounded-lg">{inStockCount}</span>
              </Link>

              <Link
                href="/admin/products?stockStatus=low_stock"
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-all hover:scale-[1.02] cursor-pointer group"
                title="View Low Stock products"
              >
                <span className="flex items-center gap-1.5 text-amber-800 font-bold group-hover:underline">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Low Stock
                </span>
                <span className="font-black text-amber-950 bg-amber-200/60 px-2 py-0.5 rounded-lg">{lowStockCount}</span>
              </Link>

              <Link
                href="/admin/products?stockStatus=out_of_stock"
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-all hover:scale-[1.02] cursor-pointer group"
                title="View Out of Stock products"
              >
                <span className="flex items-center gap-1.5 text-red-800 font-bold group-hover:underline">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Out of Stock
                </span>
                <span className="font-black text-red-950 bg-red-200/60 px-2 py-0.5 rounded-lg">{outOfStockCount}</span>
              </Link>

              <Link
                href="/admin/products?stockStatus=inactive"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all hover:scale-[1.02] cursor-pointer group"
                title="View Inactive products"
              >
                <span className="flex items-center gap-1.5 text-slate-700 font-bold group-hover:underline">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Inactive
                </span>
                <span className="font-black text-slate-900 bg-slate-300/60 px-2 py-0.5 rounded-lg">{inactiveCount}</span>
              </Link>
            </div>
          </div>

          {/* 16. TOP SELLING CATEGORIES */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>🔥</span> TOP SELLING CATEGORIES
              </h2>
              <Link href="/admin/categories" className="text-xs font-bold text-[#6D3FD6] hover:underline">
                View All →
              </Link>
            </div>

            {categorySales.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No categories recorded.</p>
            ) : (
              <div className="space-y-3.5 text-xs font-semibold">
                {categorySales.slice(0, 5).map((cat, idx) => {
                  const maxPurchases = Math.max(...categorySales.map((c) => c.totalPurchases || 1), 1);
                  const progressPct = Math.min(100, Math.round((cat.totalPurchases / maxPurchases) * 100));

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-800">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-black">{idx + 1}.</span>
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-black text-[#6D3FD6]">
                          {cat.totalPurchases} Units ({cat.ordersCount} Orders)
                        </span>
                      </div>
                      
                      {/* Horizontal Progress Bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#6D3FD6] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(8, progressPct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
        </>
      )}
    </div>
  );
}
