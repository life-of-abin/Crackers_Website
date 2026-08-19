"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getPillActiveColorClass(statusValue: string) {
  switch (statusValue) {
    case "FAILED":
    case "CANCELLED":
      return "bg-red-600 text-white border-red-600 shadow-md shadow-red-200";
    case "DELIVERED":
    case "COLLECTED":
      return "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200";
    case "READY_FOR_PICKUP":
      return "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200";
    case "SHIPPED":
    case "OUT_FOR_DELIVERY":
      return "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200";
    case "PACKED":
      return "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-200";
    case "PROCESSING":
      return "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200";
    case "CONFIRMED":
      return "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200";
    case "PLACED":
      return "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200";
    case "AWAITING_DELIVERY_CONFIRMATION":
      return "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200";
    default:
      return "bg-[#6D3FD6] text-white border-[#6D3FD6] shadow-md shadow-purple-200";
  }
}

export default function AdminOrdersFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "ALL";
  const currentType = searchParams.get("type") || "ALL";
  const currentPayment = searchParams.get("payment") || "ALL";
  const currentQuery = searchParams.get("query") || "";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/orders?${params.toString()}`);
  };

  const statusOptions = [
    { label: "ALL", value: "ALL" },
    { label: "AWAITING_DELIVERY_CONFIRMATION", value: "AWAITING_DELIVERY_CONFIRMATION" },
    { label: "PLACED", value: "PLACED" },
    { label: "CONFIRMED", value: "CONFIRMED" },
    { label: "PROCESSING", value: "PROCESSING" },
    { label: "PACKED", value: "PACKED" },
    { label: "SHIPPED", value: "SHIPPED" },
    { label: "READY_FOR_PICKUP", value: "READY_FOR_PICKUP" },
    { label: "DELIVERED", value: "DELIVERED" },
    { label: "COLLECTED", value: "COLLECTED" },
    { label: "CANCELLED", value: "CANCELLED" },
    { label: "FAILED", value: "FAILED" },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Dropdown Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Order ID (#), Customer Name, Phone, City, Pincode..."
            defaultValue={currentQuery}
            onChange={(e) => updateFilters("query", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-9 font-bold text-slate-800 focus:outline-none focus:border-[#6D3FD6] focus:bg-white transition-all text-xs"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Order Status Dropdown */}
          <select
            value={currentStatus}
            onChange={(e) => updateFilters("status", e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-none focus:border-[#6D3FD6] text-xs cursor-pointer"
          >
            <option value="ALL">📋 All Order Statuses</option>
            <option value="AWAITING_DELIVERY_CONFIRMATION">⏳ Awaiting Delivery Confirmation</option>
            <option value="PLACED">🛒 Placed</option>
            <option value="CONFIRMED">✓ Confirmed</option>
            <option value="PROCESSING">⚙️ Processing</option>
            <option value="PACKED">📦 Packed</option>
            <option value="SHIPPED">🚚 Shipped</option>
            <option value="READY_FOR_PICKUP">🏪 Ready for Pickup</option>
            <option value="DELIVERED">🎉 Delivered</option>
            <option value="COLLECTED">🛍️ Collected</option>
            <option value="CANCELLED">🚫 Cancelled</option>
            <option value="FAILED">❌ Failed</option>
          </select>

          {/* Order Type */}
          <select
            value={currentType}
            onChange={(e) => updateFilters("type", e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-none focus:border-[#6D3FD6] text-xs cursor-pointer"
          >
            <option value="ALL">📦 All Order Types</option>
            <option value="PICKUP">🏪 Store Pickup</option>
            <option value="DELIVERY">🚚 Home Delivery</option>
          </select>

          {/* Payment Status */}
          <select
            value={currentPayment}
            onChange={(e) => updateFilters("payment", e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 focus:outline-none focus:border-[#6D3FD6] text-xs cursor-pointer"
          >
            <option value="ALL">💳 All Payment Statuses</option>
            <option value="PAID">✅ Paid</option>
            <option value="PENDING">⏳ Pending</option>
            <option value="FAILED">❌ Failed</option>
            <option value="REFUNDED">↩️ Refunded</option>
          </select>

          {/* Reset Filters button */}
          {(currentStatus !== "ALL" || currentType !== "ALL" || currentPayment !== "ALL" || currentQuery) && (
            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold px-3 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
            >
              Reset Filters ↺
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs (Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold scrollbar-none">
        {statusOptions.map((st) => (
          <button
            key={st.value}
            type="button"
            onClick={() => updateFilters("status", st.value)}
            className={`px-4 py-2 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              currentStatus === st.value
                ? getPillActiveColorClass(st.value)
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>
    </div>
  );
}
