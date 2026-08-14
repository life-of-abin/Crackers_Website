import React from "react";
import Link from "next/link";
import type { StoreSettings } from "@/lib/settings";

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Column 1: Store Information & Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white text-lg font-black shadow-md gold-glow">
                🪔
              </div>
              <span className="text-xl font-black tracking-tight text-white font-display uppercase">
                {settings.storeName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct factory wholesale pricing from Sivakasi, Tamil Nadu. Premium quality genuine sparklers, rockets, gift boxes, and flower pots delivered safely to your doorstep across India.
            </p>
            <div className="pt-2">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3.5 py-2.5 rounded-xl hover:bg-amber-900/60 transition-colors"
                title="View store location on Google Maps"
              >
                <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Store Location: {settings.address}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>🏠</span> Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>🎆</span> Products
                </Link>
              </li>
              <li>
                <Link href="/products#categories" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>📦</span> Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>ℹ️</span> About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>📞</span> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>💬</span> Customer Support
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>🚚</span> Track Order Status
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>📦</span> Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>🔄</span> Returns & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-3 text-xs font-medium">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">📞</span>
                <a href="tel:9629525907" className="font-bold text-white hover:text-amber-400 transition-colors">
                  Phone: 9629525907
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">💬</span>
                <a
                  href="https://wa.me/919629525907"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  WhatsApp: 9629525907
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✉️</span>
                <a href="mailto:abinesh.ece2003@gmail.com" className="font-bold text-amber-300 hover:underline break-all">
                  Email: abinesh.ece2003@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">📍</span>
                <a
                  href={settings.googleMapsUrl || "https://maps.google.com/?q=Sivakasi,Tamil+Nadu"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Shop Location: Sivakasi, Tamil Nadu, India
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Policies */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Legal & Policies
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>🛡️</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>📜</span> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>📋</span> Cancellation & Refund Rules
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors flex items-center gap-2 font-bold text-amber-300 pt-2">
                  <span>🎆</span> Shop All Fireworks
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Trust Badges */}
        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} <span className="text-slate-300 font-bold">{settings.storeName}</span>. All Rights Reserved. Sivakasi, Tamil Nadu, India.
          </div>
          <div className="flex items-center space-x-3 text-slate-400 font-medium">
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">💳 Secure Checkout</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">📲 UPI / GPay / PhonePe</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">🚚 Safe Transit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
