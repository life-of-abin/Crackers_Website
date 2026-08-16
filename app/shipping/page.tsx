import React from "react";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default async function ShippingPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  const minOrderAmount = Number(settings.minOrderAmount) || 500;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <Header settings={settings} user={session} />

      {/* Header Banner */}
      <div className="bg-white text-slate-900 py-10 sm:py-14 border-b border-slate-200 shadow-xs text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-[#6D3FD6] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest">
            🚚 LOGISTICS & DELIVERY TERMS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 uppercase tracking-tight">
            Shipping & Store Pickup Policy
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Direct wholesale fireworks dispatch from Sivakasi, Tamil Nadu.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 w-full space-y-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl space-y-8">
          
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black text-slate-900 font-display uppercase tracking-tight">
              Current Shipping Guidelines
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please review our updated dispatch, pickup, and outstation parcel policy below.
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
            
            {/* Policy Point 1: Service Region */}
            <div className="p-4 sm:p-5 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-1.5">
              <div className="font-extrabold text-[#6D3FD6] text-sm flex items-center gap-2">
                <span>📍</span> 1. Operating Region (Tamil Nadu Only)
              </div>
              <p className="text-slate-600">
                Our online ordering, shop pickup, and parcel transport services strictly cater to customers located within <strong>Tamil Nadu</strong>. State selection is fixed to Tamil Nadu at checkout.
              </p>
            </div>

            {/* Policy Point 2: Store Pickup Policy */}
            <div className="p-4 sm:p-5 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1.5">
              <div className="font-extrabold text-emerald-700 text-sm flex items-center gap-2">
                <span>🏪</span> 2. Sivakasi Store Pickup (₹0 Delivery Charges)
              </div>
              <p className="text-slate-600">
                Customers can collect their booked orders directly from our Sivakasi main shop with <strong>zero delivery fees</strong>. Once your order is processed and packed, our team will notify you via <strong>WhatsApp / Call</strong> to confirm shop pickup readiness.
              </p>
            </div>

            {/* Policy Point 3: Outstation Parcel Transport */}
            <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-1.5">
              <div className="font-extrabold text-amber-800 text-sm flex items-center gap-2">
                <span>💬</span> 3. Outstation Parcel Transport Arrangements
              </div>
              <p className="text-slate-600">
                For outstation delivery across Tamil Nadu, transport charges are not fixed upfront online. After placing your order, our store team will contact you directly via <strong>WhatsApp / Call</strong> to discuss, arrange, and confirm convenient parcel transport options and nominal freight charges.
              </p>
            </div>

            {/* Policy Point 4: Minimum Order Requirement */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>🛒</span> 4. Minimum Order Amount Threshold
              </div>
              <p className="text-slate-600">
                To ensure efficient processing and wholesale pricing, orders must meet the minimum purchase subtotal of <strong>₹{minOrderAmount.toLocaleString("en-IN")}</strong> before proceeding to checkout.
              </p>
            </div>

            {/* Policy Point 5: Safe Heavy-Duty Packaging */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>📦</span> 5. Transport-Certified Heavy Packaging
              </div>
              <p className="text-slate-600">
                All fireworks orders are packed in heavy-duty moisture-proof corrugated boxes directly from our Sivakasi factory warehouse to ensure complete safety during handling and transit.
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs font-bold text-slate-500">
              Have questions regarding your order shipment or shop pickup?
            </p>
            <a
              href="https://wa.me/919629525907"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00B761] hover:bg-[#009E53] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
            >
              <span>💬 Contact Support on WhatsApp (9629525907)</span>
            </a>
          </div>

        </div>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
