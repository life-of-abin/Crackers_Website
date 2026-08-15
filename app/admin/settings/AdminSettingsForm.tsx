"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettingsAction } from "@/lib/actions";
import type { StoreSettings } from "@/lib/settings";

export default function AdminSettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateSettingsAction(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
          ✓ Store settings updated successfully! Customer storefront automatically updated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Store Brand Name *
            </label>
            <input
              type="text"
              name="storeName"
              required
              defaultValue={settings.storeName}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Support Phone Helpline *
            </label>
            <input
              type="text"
              name="phone"
              required
              defaultValue={settings.phone}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp Support Number *
            </label>
            <input
              type="text"
              name="whatsappNumber"
              required
              defaultValue={settings.whatsappNumber}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Support Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={settings.email}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shop Physical Address *
            </label>
            <input
              type="text"
              name="address"
              required
              defaultValue={settings.address}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Google Maps Location URL (Clicking header location opens this URL) *
            </label>
            <input
              type="url"
              name="googleMapsUrl"
              required
              defaultValue={settings.googleMapsUrl}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-slate-100 font-extrabold text-sm text-slate-900 uppercase">
            GST & Billing Configuration
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-wider mb-2">
              <input
                type="checkbox"
                name="isGstRegistered"
                value="true"
                defaultChecked={settings.isGstRegistered}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              Business is GST Registered
            </label>
            <p className="text-[10px] text-slate-500 normal-case font-normal -mt-1 ml-6">
              Enable this to generate GST Tax Invoices and calculate CGST/SGST/IGST.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Legal Business Name (For Invoice)
            </label>
            <input
              type="text"
              name="legalName"
              defaultValue={settings.legalName || ""}
              placeholder="E.g., Sri Sivakasi Crackers Pvt Ltd"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Business GSTIN
            </label>
            <input
              type="text"
              name="gstin"
              defaultValue={settings.gstin || ""}
              placeholder="E.g., 33XXXXX1234X1ZX"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600 uppercase"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Invoice Terms & Conditions
            </label>
            <textarea
              name="invoiceTerms"
              rows={4}
              defaultValue={settings.invoiceTerms || "1. Goods once sold will not be taken back.\n2. Use fireworks safely according to local laws.\n3. Subject to Sivakasi Jurisdiction."}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-red-600 leading-relaxed"
            />
          </div>

          {/* SHIPPING & DELIVERY SECTION */}
          <div className="sm:col-span-2 pt-4 border-t border-slate-200">
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider font-display">
              SHIPPING & DELIVERY
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Set the standard shipping fee applied to orders below the free-delivery threshold.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shipping Fee (₹) *
            </label>
            <input
              type="number"
              name="flatShippingFee"
              required
              min="0"
              step="any"
              defaultValue={settings.flatShippingFee}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Applied to customer orders below ₹3,000.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Free Shipping Order Threshold (₹) *
            </label>
            <input
              type="number"
              name="freeShippingThreshold"
              required
              min="0"
              step="any"
              defaultValue={settings.freeShippingThreshold}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Orders at or above this amount receive FREE shipping (Default: ₹3,000).
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Minimum Order Amount (₹) *
            </label>
            <input
              type="number"
              name="minOrderAmount"
              required
              min="0"
              step="any"
              defaultValue={settings.minOrderAmount}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer shadow-purple-200"
          >
            {loading ? "Saving Settings..." : "Save Changes →"}
          </button>
        </div>

      </form>

    </div>
  );
}
