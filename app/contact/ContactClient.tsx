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
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA] font-sans">
      <Header settings={settings} user={user} />

      {/* Hero Section */}
      <section className="relative bg-festive-hero text-[#FFF9EA] overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-[#292E4D] text-center">
        <HeroFireworks />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F5C451_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#11152E] border border-[#F5C451]/40 text-[#F5C451] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F5C451] animate-ping" />
            ✨ 24/7 CUSTOMER HELP & SUPPORT
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase font-display text-[#FFF9EA]">
            How Can We Help You Today?
          </h1>

          <p className="text-[#B9B8C7] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            We are dedicated to making your Diwali fireworks shopping smooth and delightful. Get instant answers, order tracking, or speak directly with our Sivakasi customer service team.
          </p>
        </div>
      </section>

      {/* Support Action Cards */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-16">
        
        {/* 4 Support Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Option 1: Call Us */}
          <div className="bg-[#151A35] border border-[#292E4D] rounded-3xl p-6 shadow-xl hover:border-[#6D3FD6] transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#11152E] border border-[#292E4D] text-[#F5C451] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📞
              </div>
              <div>
                <h3 className="text-base font-black text-[#FFF9EA] uppercase tracking-tight font-display">Call Helpline</h3>
                <p className="text-xs text-[#B9B8C7] mt-1">Speak directly with our customer support team</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-[#B9B8C7] block uppercase text-[10px]">Phone Number</span>
                <p className="text-base font-black text-[#F5C451] font-mono">9629525907</p>
              </div>
            </div>
            <div className="pt-6">
              <a
                href="tel:9629525907"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#11152E] hover:bg-[#F5C451] hover:text-[#080B1A] text-[#FFF9EA] font-extrabold text-xs uppercase tracking-wider transition-colors border border-[#292E4D]"
              >
                <span>📞 Call Now</span>
              </a>
              <span className="text-[10px] text-[#B9B8C7] text-center block mt-2 font-medium">Mon - Sat: 9:00 AM - 9:00 PM</span>
            </div>
          </div>

          {/* Option 2: WhatsApp */}
          <div className="bg-[#151A35] border border-[#292E4D] rounded-3xl p-6 shadow-xl hover:border-[#6D3FD6] transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#11152E] border border-[#292E4D] text-[#4ADE80] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                💬
              </div>
              <div>
                <h3 className="text-base font-black text-[#FFF9EA] uppercase tracking-tight font-display">WhatsApp Support</h3>
                <p className="text-xs text-[#B9B8C7] mt-1">Quick replies, order updates & catalogue assistance</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-[#B9B8C7] block uppercase text-[10px]">WhatsApp Chat</span>
                <p className="text-base font-black text-[#4ADE80] font-mono">9629525907</p>
              </div>
            </div>
            <div className="pt-6">
              <a
                href="https://wa.me/919629525907"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#4ADE80] hover:bg-[#4ADE80]/90 text-[#080B1A] font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                <span>💬 Chat on WhatsApp</span>
              </a>
              <span className="text-[10px] text-[#B9B8C7] text-center block mt-2 font-medium">Fastest response channel</span>
            </div>
          </div>

          {/* Option 3: Email */}
          <div className="bg-[#151A35] border border-[#292E4D] rounded-3xl p-6 shadow-xl hover:border-[#6D3FD6] transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#11152E] border border-[#292E4D] text-[#F5C451] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📧
              </div>
              <div>
                <h3 className="text-base font-black text-[#FFF9EA] uppercase tracking-tight font-display">Email Support</h3>
                <p className="text-xs text-[#B9B8C7] mt-1">For detailed inquiries, invoices & corporate orders</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-[#B9B8C7] block uppercase text-[10px]">Email Address</span>
                <p className="text-xs font-bold text-[#F5C451] truncate">abinesh.ece2003@gmail.com</p>
              </div>
            </div>
            <div className="pt-6">
              <a
                href="mailto:abinesh.ece2003@gmail.com"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#11152E] hover:bg-[#F5C451] hover:text-[#080B1A] text-[#FFF9EA] font-extrabold text-xs uppercase tracking-wider transition-colors border border-[#292E4D]"
              >
                <span>📧 Send Email</span>
              </a>
              <span className="text-[10px] text-[#B9B8C7] text-center block mt-2 font-medium">Replies within 24 hours</span>
            </div>
          </div>

          {/* Option 4: Track Order */}
          <div className="bg-[#151A35] border border-[#292E4D] rounded-3xl p-6 shadow-xl hover:border-[#6D3FD6] transition-all flex flex-col justify-between group festive-card-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#11152E] border border-[#292E4D] text-[#FFE29A] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📦
              </div>
              <div>
                <h3 className="text-base font-black text-[#FFF9EA] uppercase tracking-tight font-display">Track Order</h3>
                <p className="text-xs text-[#B9B8C7] mt-1">Check real-time dispatch, courier & shipping status</p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold text-[#B9B8C7] block uppercase text-[10px]">Online Tracker</span>
                <p className="text-xs font-extrabold text-[#F5C451]">Order ID + Gmail Required</p>
              </div>
            </div>
            <div className="pt-6">
              <Link
                href="/track-order"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl gold-glow"
              >
                <span>🚚 Track Order Now</span>
              </Link>
              <span className="text-[10px] text-[#B9B8C7] text-center block mt-2 font-medium">Live status & invoice download</span>
            </div>
          </div>

        </div>

        {/* 2-Column Section: Store Info & Send Message Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Store Details */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#151A35] border border-[#292E4D] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-[#292E4D] pb-4">
                <span className="text-[10px] font-black text-[#F5C451] uppercase tracking-widest block mb-1">
                  MAIN DISTRIBUTION CENTER
                </span>
                <h2 className="text-xl font-black text-[#FFF9EA] uppercase font-display">
                  Sivakasi Store & Hub
                </h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#B9B8C7] font-bold uppercase block text-[10px] mb-1">Store Address</span>
                  <p className="font-extrabold text-[#FFF9EA] text-sm">{settings.storeName}</p>
                  <p className="text-[#B9B8C7] leading-relaxed mt-0.5">Sivakasi, Tamil Nadu, India</p>
                </div>

                <a
                  href={settings.googleMapsUrl || "https://maps.google.com/?q=Sivakasi,Tamil+Nadu"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#11152E] border border-[#292E4D] text-[#F5C451] hover:border-[#6D3FD6] rounded-xl font-bold text-xs transition-colors"
                >
                  <span>📍 Open Google Maps Directions →</span>
                </a>
              </div>

              {/* Support Promises */}
              <div className="pt-4 border-t border-[#292E4D] space-y-3">
                <h3 className="text-xs font-black text-[#FFF9EA] uppercase tracking-wider font-display">
                  Our Support Promise
                </h3>
                <ul className="space-y-2 text-xs text-[#B9B8C7]">
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#4ADE80] font-bold">✓</span>
                    <span>100% Genuine Direct Sivakasi Crackers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#4ADE80] font-bold">✓</span>
                    <span>Transport-Certified Heavy Safe Packaging</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#4ADE80] font-bold">✓</span>
                    <span>Instant WhatsApp Order Updates & SMS Alerts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-[#4ADE80] font-bold">✓</span>
                    <span>Official Tax Invoice Provided with Every Order</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#151A35] border border-[#292E4D] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-[#292E4D] pb-4">
                <span className="text-[10px] font-black text-[#F5C451] uppercase tracking-widest block mb-1">
                  DIRECT ENQUIRY FORM
                </span>
                <h2 className="text-xl font-black text-[#FFF9EA] uppercase font-display">
                  Send Support Message
                </h2>
                <p className="text-xs text-[#B9B8C7] mt-1">
                  Fill out the form below and our customer care team will get back to you promptly.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 bg-[#11152E] border border-[#4ADE80]/40 rounded-2xl text-center space-y-3">
                  <span className="text-4xl block">🎉</span>
                  <h3 className="text-lg font-black text-[#4ADE80] uppercase font-display">Message Sent Successfully!</h3>
                  <p className="text-xs text-[#B9B8C7] max-w-md mx-auto">
                    Thank you for reaching out to Sivakasi Crackers. Our support team will review your inquiry and contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-block bg-[#F5C451] text-[#080B1A] font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#FFE29A] transition-colors mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#B9B8C7] uppercase mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Abinesh Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#B9B8C7] uppercase mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="9629525907"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#B9B8C7] uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="abinesh.ece2003@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#B9B8C7] uppercase mb-1">Inquiry Topic</label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
                      >
                        <option value="Order Status">Order Status Inquiry</option>
                        <option value="Product Details">Product / Catalogue Query</option>
                        <option value="Bulk Order">Bulk / Wholesale Booking</option>
                        <option value="Payment Issue">Payment Assistance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#B9B8C7] uppercase mb-1">Message *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message or inquiry here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7]/50 focus:outline-none focus:ring-2 focus:ring-[#F5C451]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors gold-glow"
                  >
                    {isSubmitting ? "Sending Message..." : "Submit Inquiry →"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* FAQs Accordion Section */}
        <div className="bg-[#151A35] border border-[#292E4D] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-black text-[#F5C451] uppercase tracking-widest block">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="text-2xl font-black text-[#FFF9EA] uppercase font-display">Got Questions? We Have Answers</h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq) => (
              <div key={faq.id} className="border border-[#292E4D] rounded-2xl overflow-hidden bg-[#11152E]">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-[#FFF9EA] flex justify-between items-center hover:text-[#F5C451] transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className="text-base font-mono ml-2 text-[#F5C451]">{openFaq === faq.id ? "−" : "+"}</span>
                </button>

                {openFaq === faq.id && (
                  <div className="px-5 pb-4 text-xs text-[#B9B8C7] leading-relaxed border-t border-[#292E4D] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer settings={settings} />
    </div>
  );
}
