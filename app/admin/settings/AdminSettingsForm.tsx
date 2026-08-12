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
            Order & Shipping Rules
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Minimum Order Threshold (₹) *
            </label>
            <input
              type="number"
              name="minOrderAmount"
              required
              defaultValue={settings.minOrderAmount}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Flat Shipping Fee (₹) *
            </label>
            <input
              type="number"
              name="flatShippingFee"
              required
              defaultValue={settings.flatShippingFee}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Free Shipping Order Threshold (₹) *
            </label>
            <input
              type="number"
              name="freeShippingThreshold"
              required
              defaultValue={settings.freeShippingThreshold}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-red-600"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold rounded-xl shadow hover:from-red-700 hover:to-amber-700 transition-all disabled:opacity-50"
          >
            {loading ? "Saving Settings..." : "Save Settings to Database →"}
          </button>
        </div>

      </form>

    </div>
  );
}
