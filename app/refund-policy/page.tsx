import React from "react";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default async function RefundPolicyPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} user={session} />
      <div className="bg-slate-900 text-white py-10 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-black">Refund & Cancellation Policy</h1>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full text-xs text-slate-700 leading-relaxed">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Cancellation & Returns</h2>
          <p>Orders can be cancelled before dispatch from our Sivakasi warehouse by calling our support line ({settings.phone}).</p>
          <p>In case of transit damage, damaged boxes will be replaced or refunded upon submitting an unboxing video within 24 hours of delivery.</p>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
