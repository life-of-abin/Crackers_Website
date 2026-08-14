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
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} user={session} />

      <div className="bg-[#11152E] text-[#FFF9EA] py-12 border-b border-[#292E4D]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <span className="text-xs font-black text-[#F5C451] uppercase tracking-widest">Sivakasi Heritage</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#FFF9EA] font-display">About {settings.storeName}</h1>
          <p className="text-xs sm:text-sm text-[#B9B8C7] max-w-xl mx-auto">
            Bringing authentic Sivakasi festival crackers & fireworks directly from licensed manufacturers to your celebration.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8 text-xs text-[#B9B8C7] leading-relaxed">
        <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-8 shadow-xl space-y-6">
          <h2 className="text-lg font-black text-[#FFF9EA] border-b border-[#292E4D] pb-3 font-display">Our Legacy & Mission</h2>
          <p>
            Located in Sivakasi, Tamil Nadu—the fireworks capital of India—our company has been a trusted supplier of festive fireworks for over two decades. We specialize in providing 100% genuine crackers, sparklers, rockets, ground chakkars, and family gift boxes at direct wholesale factory prices.
          </p>
          <p>
            Our mission is to make festival celebrations safer, brighter, and more affordable for families across India by eliminating middleman markups and enforcing rigorous safety quality checks on all products.
          </p>

          <h2 className="text-lg font-black text-[#FFF9EA] border-b border-[#292E4D] pb-3 pt-4 font-display">Why Buy Direct From Sivakasi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D]">
              <h3 className="font-extrabold text-[#F5C451] mb-1">🏭 Factory Wholesale Rates</h3>
              <p className="text-[#B9B8C7]">Save up to 50% - 80% compared to local retail shop prices.</p>
            </div>
            <div className="bg-[#11152E] p-4 rounded-2xl border border-[#292E4D]">
              <h3 className="font-extrabold text-[#F5C451] mb-1">🛡️ Certified Safety Standards</h3>
              <p className="text-[#B9B8C7]">All items comply with Indian explosives regulations and sound limits.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
