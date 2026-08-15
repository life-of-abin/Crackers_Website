import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";

export default async function AdminOffersPage() {
  const session = await requireAdmin();

  // Fetch active settings or offer configurations if available
  const settings = await prisma.settings.findFirst();

  return (
    <AdminNav user={session}>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-widest block">
              Promotions & Seasonal Discounts
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Festival Offers
            </h1>
          </div>

          <Link
            href="/admin/dashboard"
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Current Festival Banner Highlight Card */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none font-black">
            🪔
          </div>

          <div className="relative z-10 space-y-3 max-w-xl">
            <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
              Diwali Festival Season Live
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Special Diwali Crackers Discount Sale
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Manage active customer discounts, free shipping thresholds, combo discounts, and promotional banners displayed across the store.
            </p>
          </div>
        </div>

        {/* Active Promotional Offer Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Threshold Offer */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-wider">
                🚚 Shipping Promotion
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Active
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Free Shipping Threshold
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customers receive free shipping when order value exceeds the threshold below.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Minimum</span>
                <span className="text-xl font-black text-slate-900">
                  ₹{Number(settings?.freeShippingThreshold || 3000).toLocaleString("en-IN")}
                </span>
              </div>
              <Link
                href="/admin/settings"
                className="bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-200"
              >
                Edit Threshold →
              </Link>
            </div>
          </div>

          {/* Minimum Order Value Offer */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-wider">
                📦 Order Requirement
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Enforced
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Minimum Cart Checkout Limit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ensures all orders meet minimum order value requirements for bulk Sivakasi dispatch.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Minimum</span>
                <span className="text-xl font-black text-slate-900">
                  ₹{Number(settings?.minOrderAmount || 500).toLocaleString("en-IN")}
                </span>
              </div>
              <Link
                href="/admin/settings"
                className="bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-200"
              >
                Update Limit →
              </Link>
            </div>
          </div>
        </div>

        {/* Promo Code & Banner Announcements Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
              📣 Storefront Announcement Banner
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Top announcement message visible on the customer homepage during festive seasons.
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#6D3FD6] uppercase tracking-wider block">
                Active Store Announcement
              </span>
              <span className="font-extrabold text-sm text-slate-900 block">
                ✨ Official Sivakasi Direct Factory Wholesale Prices • Minimum Order ₹500
              </span>
            </div>
            <Link
              href="/admin/settings"
              className="bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-200 shrink-0"
            >
              Modify Banner Text
            </Link>
          </div>
        </div>
      </div>
    </AdminNav>
  );
}
