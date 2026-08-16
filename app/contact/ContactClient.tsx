"use client";

import React, { useState } from "react";
import type { StoreSettings } from "@/lib/settings";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import HeroFireworks from "@/components/ui/HeroFireworks";

interface ContactClientProps {
  settings: StoreSettings;
  user?: any;
}

const FAQS = [
  {
    id: 1,
    question: "How do I track my order status?",
    answer:
      "You can track your order anytime using your Order ID and registered email address on our dedicated Track Order page. You will see live dispatch progress from packing to delivery.",
  },
  {
    id: 2,
    question: "Are all your fireworks genuine and direct from Sivakasi?",
    answer:
      "Yes! All our products are 100% genuine crackers manufactured and packed directly in Sivakasi, Tamil Nadu. We guarantee fresh stock, safe packaging, and premium performance.",
  },
  {
    id: 3,
    question: "What are your shipping & store pickup options?",
    answer:
      "You can pick up your order directly from our Sivakasi shop with 0 extra charges, or we will assist in arranging outstation parcel transport via WhatsApp after order placement.",
  },
  {
    id: 4,
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "If your order has not been packed or dispatched yet, our support team can assist with order modifications or cancellation. Please contact us via WhatsApp or phone as soon as possible.",
  },
  {
    id: 5,
    question: "How do I place an order?",
    answer:
      "Select your items, enter your delivery address and contact information at checkout, and submit your order directly on our website.",
  },
];

export default function ContactClient({ settings, user }: ContactClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const storePhone = settings.supportPhone || "9629525907";
  const whatsappPhone = settings.whatsappNumber || storePhone;
  const storeEmail = settings.supportEmail || "abinesh.ece2003@gmail.com";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <Header settings={settings} user={user} />

      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-b from-purple-50 via-white to-[#F8FAFC] text-slate-900 overflow-hidden py-14 sm:py-18 border-b border-slate-200 text-center">
        <HeroFireworks />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6D3FD6_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-[#6D3FD6] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-[#6D3FD6] animate-ping" />
            ✨ CUSTOMER HELP & SUPPORT
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase font-display text-slate-900">
            How Can We Help You Today?
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Reach out directly to our Sivakasi fireworks customer service team via phone, WhatsApp, email, or visit our store location.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full space-y-16">
        
        {/* 4 Support Options Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Call Helpline */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-pink-50 border border-pink-100 text-pink-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📞
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-display">
                  Call Helpline
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Speak directly with our customer support team
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  PHONE NUMBER
                </span>
                <p className="text-base font-black text-[#6D3FD6] font-mono mt-0.5">
                  {storePhone}
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <a
                href={`tel:${storePhone}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-[#6D3FD6] hover:text-white text-slate-800 font-extrabold text-xs uppercase tracking-wider transition-all border border-slate-200 shadow-xs"
              >
                <span>📞 CALL NOW</span>
              </a>
              <span className="text-[11px] text-slate-400 text-center block font-medium">
                Mon - Sat: 9:00 AM - 9:00 PM
              </span>
            </div>
          </div>

          {/* Card 2: WhatsApp Support */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                💬
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-display">
                  WhatsApp Support
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Quick replies, order updates & catalogue assistance
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  WHATSAPP CHAT
                </span>
                <p className="text-base font-black text-emerald-600 font-mono mt-0.5">
                  {whatsappPhone}
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <a
                href={`https://wa.me/91${whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#00B761] hover:bg-[#009E53] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>💬 CHAT ON WHATSAPP</span>
              </a>
              <span className="text-[11px] text-slate-400 text-center block font-medium">
                Fastest response channel
              </span>
            </div>
          </div>

          {/* Card 3: Email Support */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-purple-50 border border-purple-100 text-[#6D3FD6] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📧
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-display">
                  Email Support
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  For detailed inquiries, invoices & corporate orders
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  EMAIL ADDRESS
                </span>
                <p className="text-xs font-bold text-[#6D3FD6] truncate mt-0.5">
                  {storeEmail}
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <a
                href={`mailto:${storeEmail}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-[#6D3FD6] hover:text-white text-slate-800 font-extrabold text-xs uppercase tracking-wider transition-all border border-slate-200 shadow-xs"
              >
                <span>✉️ SEND EMAIL</span>
              </a>
              <span className="text-[11px] text-slate-400 text-center block font-medium">
                Replies within 24 hours
              </span>
            </div>
          </div>

          {/* Card 4: Store Location */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📍
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight font-display">
                  Store Location
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Visit our store & explore our exclusive collection
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  STORE ADDRESS
                </span>
                <p className="text-xs font-black text-slate-900">
                  {settings.storeName || "Sri Sivakasi Crackers"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Sivakasi, Tamil Nadu, India
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <a
                href={settings.googleMapsUrl || "https://maps.google.com/?q=Sivakasi,Tamil+Nadu"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-[#6D3FD6] hover:text-white text-slate-800 font-extrabold text-xs uppercase tracking-wider transition-all border border-slate-200 shadow-xs"
              >
                <span>📍 VIEW LOCATION</span>
              </a>
              <span className="text-[11px] text-slate-400 text-center block font-medium">
                Open Daily: 9:00 AM - 9:00 PM
              </span>
            </div>
          </div>

        </div>

        {/* FAQs Accordion Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-black text-[#6D3FD6] uppercase tracking-widest block">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display">
              Got Questions? We Have Answers
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq) => (
              <div key={faq.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center hover:text-[#6D3FD6] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <span className="text-base font-mono ml-2 text-[#6D3FD6]">
                    {openFaq === faq.id ? "−" : "+"}
                  </span>
                </button>

                {openFaq === faq.id && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Global Site Footer */}
      <Footer settings={settings} />
    </div>
  );
}
