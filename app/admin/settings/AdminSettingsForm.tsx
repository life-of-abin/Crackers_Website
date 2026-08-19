"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettingsAction } from "@/lib/actions";
import type { StoreSettings } from "@/lib/settings";

function extract10Digits(val: string): string {
  if (!val) return "";
  let digits = val.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  } else if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits.slice(0, 10);
}

export default function AdminSettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [phone, setPhone] = useState(extract10Digits(settings.phone));
  const [whatsappNumber, setWhatsappNumber] = useState(extract10Digits(settings.whatsappNumber));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setError("Support Phone Helpline must be a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.");
      return;
    }

    if (whatsappNumber.length !== 10 || !/^[6-9]\d{9}$/.test(whatsappNumber)) {
      setError("WhatsApp Support Number must be a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.");
      return;
    }

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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#6D3FD6]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Support Phone Helpline *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-[#6D3FD6] bg-slate-50">
              <span className="inline-flex items-center px-3.5 bg-slate-100 border-r border-slate-200 text-slate-700 font-extrabold text-xs select-none">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                className="w-full px-3.5 py-2.5 bg-slate-50 font-black text-slate-900 text-sm focus:outline-none tracking-wider font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              10-digit mobile number (e.g. 9629525907)
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp Support Number *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-[#6D3FD6] bg-slate-50">
              <span className="inline-flex items-center px-3.5 bg-slate-100 border-r border-slate-200 text-slate-700 font-extrabold text-xs select-none">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                name="whatsappNumber"
                required
                maxLength={10}
                placeholder="9876543210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                className="w-full px-3.5 py-2.5 bg-slate-50 font-black text-slate-900 text-sm focus:outline-none tracking-wider font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              10-digit mobile number for WhatsApp customer support
            </p>
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
              MINIMUM ORDER CONFIGURATION
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Set the minimum order value required for customer purchases.
            </p>
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
            <span className="text-[10px] text-slate-400 mt-1 block">
              Customers cannot place orders below this minimum subtotal amount.
            </span>
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
