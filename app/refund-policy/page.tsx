import React from "react";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default async function RefundPolicyPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} user={session} />
      <div className="bg-[#11152E] text-[#FFF9EA] py-10 border-b border-[#292E4D]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-black font-display">Refund & Cancellation Policy</h1>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full text-xs text-[#B9B8C7] leading-relaxed">
        <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] p-8 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-[#FFF9EA] font-display border-b border-[#292E4D] pb-2">Cancellation & Returns</h2>
          <p>Orders can be cancelled before dispatch from our Sivakasi warehouse by calling our support line ({settings.phone}).</p>
          <p>In case of transit damage, damaged boxes will be replaced or refunded upon submitting an unboxing video within 24 hours of delivery.</p>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
