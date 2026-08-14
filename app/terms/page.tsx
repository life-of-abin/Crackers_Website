import React from "react";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default async function TermsPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} user={session} />
      <div className="bg-[#11152E] text-[#FFF9EA] py-10 border-b border-[#292E4D]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-black font-display">Terms & Conditions</h1>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full text-xs text-[#B9B8C7] leading-relaxed">
        <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-8 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-[#FFF9EA] font-display border-b border-[#292E4D] pb-2">User Agreement</h2>
          <p>1. By placing an order on {settings.storeName}, you confirm that you are at least 18 years of age.</p>
          <p>2. Fireworks must be stored and handled in accordance with manufacturer instructions and local civic guidelines.</p>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
