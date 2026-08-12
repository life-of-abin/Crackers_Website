import React from "react";
import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} user={session} />

      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Contact Store Support</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Have questions about your order or product catalogue? Our Sivakasi team is here to assist.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 uppercase">
              Store Contact Information
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Shop Location</span>
                <p className="font-extrabold text-slate-900 text-sm">{settings.storeName}</p>
                <p className="text-slate-600">{settings.address}</p>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 font-bold text-amber-700 hover:underline"
                >
                  📍 Open Google Maps Directions →
                </a>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Phone Helpline</span>
                <a href={`tel:${settings.phone}`} className="font-black text-red-700 text-base">
                  {settings.phone}
                </a>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">WhatsApp Support</span>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-extrabold text-emerald-600 text-sm hover:underline"
                >
                  💬 Chat on WhatsApp ({settings.whatsappNumber})
                </a>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block text-[10px]">Email Enquiries</span>
                <a href={`mailto:${settings.email}`} className="font-bold text-slate-800 hover:text-red-700">
                  {settings.email}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 uppercase">
              Send Message
            </h2>

            <form className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                <input type="text" required placeholder="Rajesh Kumar" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input type="tel" required placeholder="9876543210" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message / Inquiry</label>
                <textarea rows={3} required placeholder="Write your question here..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <button type="submit" className="w-full py-3 bg-red-600 text-white font-extrabold rounded-xl hover:bg-red-700 transition-colors uppercase">
                Submit Enquiry →
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
