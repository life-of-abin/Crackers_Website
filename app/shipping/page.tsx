import React from "react";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default async function ShippingPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} user={session} />
      <div className="bg-white text-slate-900 py-10 border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-black font-display text-slate-900">Shipping & Delivery Policy</h1>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6 text-xs text-slate-600 leading-relaxed">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 font-display border-b border-slate-200 pb-2">Dispatch & Transit Terms</h2>
          <p>1. All orders are packed in heavy-duty moisture-proof corrugated boxes from our Sivakasi main bazaar warehouse.</p>
          <p>2. Flat shipping fee is ₹{settings.flatShippingFee} for orders below ₹{settings.freeShippingThreshold.toLocaleString('en-IN')}. Free shipping applies automatically above ₹{settings.freeShippingThreshold.toLocaleString('en-IN')}.</p>
          <p>3. Dispatch occurs within 24–48 hours of order confirmation. Transit times range from 3 to 7 business days depending on delivery location.</p>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
