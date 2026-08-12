"use client";

import React, { useState } from "react";
import Link from "next/link";
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
      "You can track your order anytime using your Order ID and registered Gmail address on our dedicated Track Order page. You will see live dispatch progress from packing to delivery.",
  },
  {
    id: 2,
    question: "Are all your fireworks genuine and direct from Sivakasi?",
    answer:
      "Yes! All our products are 100% genuine crackers manufactured and packed directly in Sivakasi, Tamil Nadu. We guarantee fresh stock, safe packaging, and premium performance.",
  },
  {
    id: 3,
    question: "What are your shipping timelines and charges?",
    answer:
      "We offer express transport delivery across India. Orders are dispatched within 24 hours. We offer FREE shipping on orders over ₹3,000, with a flat nominal shipping fee on smaller orders.",
  },
  {
    id: 4,
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "If your order has not been packed or dispatched yet, our support team can assist with order modifications or cancellation. Please contact us via WhatsApp or phone as soon as possible.",
  },
  {
    id: 5,
    question: "What payment options are supported?",
    answer:
      "We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm), Net Banking, and Debit/Credit cards through our secure payment gateway.",
  },
];

export default function ContactClient({ settings, user }: ContactClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    topic: "Order Status",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", phone: "", email: "", topic: "Order Status", message: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header settings={settings} user={user} />

      {/* Hero Section */}
      <section className="relative bg-festive-hero text-white overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-amber-500/20 text-center">
        <HeroFireworks />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            ✨ 24/7 CUSTOMER HELP & SUPPORT
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase font-display">
            How Can We Help You Today?
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            We are dedicated to making your Diwali fireworks shopping smooth and delightful. Get instant answers, order tracking, or speak directly with our Sivakasi customer service team.
          </p>
        </div>
      </section>

      {/* Support Action Cards */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-16">
        
        {/* 4 Support Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Option 1: Call Us */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📞
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Call Helpline</h3>
                <p className="text-xs text-slate-500 mt-1">Speak directly with our customer support team</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 block uppercase text-[10px]">Phone Number</span>
                <p className="text-base font-black text-slate-900 font-mono">{settings.phone}</p>
              </div>
            </div>
            <div className="pt-6">
              <a
                href={`tel:${settings.phone}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 hover:bg-rose-600 hover:text-white text-slate-800 font-extrabold text-xs uppercase tracking-wider transition-colors border border-slate-200"
              >
                <span>📞 Call Now</span>
              </a>
              <span className="text-[10px] text-slate-400 text-center block mt-2 font-medium">Mon - Sat: 9:00 AM - 9:00 PM</span>
            </div>
          </div>

          {/* Option 2: WhatsApp */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                💬
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">WhatsApp Support</h3>
                <p className="text-xs text-slate-500 mt-1">Quick replies, order updates & catalogue assistance</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 block uppercase text-[10px]">WhatsApp Chat</span>
                <p className="text-base font-black text-emerald-600 font-mono">{settings.whatsappNumber}</p>
              </div>
            </div>
            <div className="pt-6">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                <span>💬 Chat on WhatsApp</span>
              </a>
              <span className="text-[10px] text-slate-400 text-center block mt-2 font-medium">Fastest response channel</span>
            </div>
          </div>

          {/* Option 3: Email */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📧
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Email Support</h3>
                <p className="text-xs text-slate-500 mt-1">For detailed inquiries, invoices & corporate orders</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 block uppercase text-[10px]">Email Address</span>
                <p className="text-xs font-bold text-amber-600 truncate">{settings.email}</p>
              </div>
            </div>
            <div className="pt-6">
              <a
                href={`mailto:${settings.email}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 hover:bg-amber-500 hover:text-white text-slate-800 font-extrabold text-xs uppercase tracking-wider transition-colors border border-slate-200"
              >
                <span>📧 Send Email</span>
              </a>
              <span className="text-[10px] text-slate-400 text-center block mt-2 font-medium">Replies within 24 hours</span>
            </div>
          </div>

          {/* Option 4: Track Order */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📦
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Track Order</h3>
                <p className="text-xs text-slate-500 mt-1">Check real-time dispatch, courier & shipping status</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 block uppercase text-[10px]">Online Tracker</span>
                <p className="text-xs font-extrabold text-amber-600">Order ID + Gmail Required</p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/track-order"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl gold-glow"
              >
                <span>🚚 Track Order Now</span>
              </Link>
              <span className="text-[10px] text-slate-400 text-center block mt-2 font-medium">Live status & invoice download</span>
            </div>
          </div>

        </div>

        {/* 2-Column Section: Store Info & Send Message Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Store Details & Guarantee (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Store Information Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">
                  MAIN DISTRIBUTION CENTER
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase font-display">
                  Sivakasi Store & Hub
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 font-bold uppercase block text-[10px] mb-1">Store Address</span>
                  <p className="font-extrabold text-slate-900 text-sm">{settings.storeName}</p>
                  <p className="text-slate-600 leading-relaxed mt-0.5">{settings.address}</p>
                </div>

                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl font-bold text-xs transition-colors"
                >
                  <span>📍 Open Google Maps Directions →</span>
                </a>
              </div>

              {/* Direct Support Badges */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Our Support Promise
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>100% Genuine Direct Sivakasi Crackers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Transport-Certified Heavy Safe Packaging</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Instant WhatsApp Order Updates & SMS Alerts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Official GST Tax Invoice Provided with Every Order</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Right Column: Send Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">
                  DIRECT ENQUIRY FORM
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase font-display">
                  Send Support Message
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill out the form below and our customer care team will get back to you promptly.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <span className="text-4xl block">🎉</span>
                  <h3 className="text-lg font-black text-emerald-700 uppercase">Message Sent Successfully!</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out to Sivakasi Crackers. Our support team will review your inquiry and contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-block mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl transition-colors shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-medium"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rajesh@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-medium"
                      />
                    </div>

                    {/* Inquiry Topic */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Inquiry Topic *
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-medium"
                      >
                        <option value="Order Status">Order Status & Tracking</option>
                        <option value="Product Inquiry">Product Information & Recommendations</option>
                        <option value="Shipping & Delivery">Shipping & Transport Inquiry</option>
                        <option value="Payment Issue">Payment & Invoice Query</option>
                        <option value="Bulk Order">Bulk / Wholesale Purchase</option>
                        <option value="Other">General Support</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Message / Inquiry Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please describe your question or order concern..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all font-medium"
                    />
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl gold-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Sending Support Inquiry...</span>
                      </>
                    ) : (
                      <span>Submit Inquiry Message →</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Support FAQ Section (Accordion) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
              HELP & FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-display">
              Support FAQs
            </h2>
            <p className="text-xs text-slate-500">
              Quick answers to common questions about ordering, dispatch, packaging, and deliveries.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen
                      ? "bg-white border-amber-500/40 shadow-lg ring-1 ring-amber-500/20"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      {faq.question}
                    </span>
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-transform ${isOpen ? "rotate-180 bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600"}`}>
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact CTA Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 border border-amber-400/30 rounded-3xl p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl font-black text-white uppercase font-display">
              Still Have Questions?
            </h3>
            <p className="text-xs text-amber-100">
              Our Sivakasi fireworks support specialists are ready to assist you right now via WhatsApp or phone.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg inline-flex items-center gap-2"
              >
                <span>💬 Chat on WhatsApp</span>
              </a>
              <a
                href={`tel:${settings.phone}`}
                className="py-3 px-6 rounded-xl bg-white hover:bg-amber-50 text-amber-600 border border-amber-100 font-extrabold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-md"
              >
                <span>📞 Call {settings.phone}</span>
              </a>
            </div>
          </div>
        </div>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
