import React from "react";
import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default async function AboutPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} user={session} />

      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Sivakasi Heritage</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">About {settings.storeName}</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Bringing authentic Sivakasi festival crackers & fireworks directly from licensed manufacturers to your celebration.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8 text-xs text-slate-700 leading-relaxed">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Our Legacy & Mission</h2>
          <p>
            Located in Sivakasi, Tamil Nadu—the fireworks capital of India—our company has been a trusted supplier of festive fireworks for over two decades. We specialize in providing 100% genuine crackers, sparklers, rockets, ground chakkars, and family gift boxes at direct wholesale factory prices.
          </p>
          <p>
            Our mission is to make festival celebrations safer, brighter, and more affordable for families across India by eliminating middleman markups and enforcing rigorous safety quality checks on all products.
          </p>

          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 pt-4">Why Buy Direct From Sivakasi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="font-extrabold text-slate-900 mb-1">🏭 Factory Wholesale Rates</h3>
              <p>Save up to 50% - 80% compared to local retail shop prices.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="font-extrabold text-slate-900 mb-1">🛡️ Certified Safety Standards</h3>
              <p>All items comply with Indian explosives regulations and sound limits.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
