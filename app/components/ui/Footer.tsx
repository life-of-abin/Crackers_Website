import React from "react";
import Link from "next/link";
import { StoreSettings } from "@/lib/settings";

interface FooterProps {
  settings: StoreSettings;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Store Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white text-lg font-bold">
                🪔
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">
                {settings.storeName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier online store for genuine Sivakasi fireworks and festival crackers. Direct factory rates, 100% safe packaging, and nationwide express delivery.
            </p>
            <div className="pt-2">
              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-3 py-2 rounded-lg hover:bg-amber-900/60 transition-colors"
              >
                📍 Store Location: {settings.address}
              </a>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Popular Categories
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/sparklers" className="hover:text-amber-400 transition-colors">
                  Electric & Crackling Sparklers
                </Link>
              </li>
              <li>
                <Link href="/category/rockets" className="hover:text-amber-400 transition-colors">
                  Lunik & Fancy Sound Rockets
                </Link>
              </li>
              <li>
                <Link href="/category/gift-items" className="hover:text-amber-400 transition-colors font-semibold text-amber-300">
                  🎁 Festive Family Gift Boxes
                </Link>
              </li>
              <li>
                <Link href="/category/flower-pots" className="hover:text-amber-400 transition-colors">
                  Color & Deluxe Flower Pots
                </Link>
              </li>
              <li>
                <Link href="/category/chakkars" className="hover:text-amber-400 transition-colors">
                  Ground Chakkars & Spinning Wheels
                </Link>
              </li>
              <li>
                <Link href="/category/atom-bomb" className="hover:text-amber-400 transition-colors">
                  Green & Hydrogen Atom Bombs
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Policies */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Customer Information
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About Our Business
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Us & Support
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-amber-400 transition-colors">
                  Shipping & Delivery Terms
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-amber-400 transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Contact */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Store Support
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-sm">📞</span>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase">Phone Orders / Helpline</span>
                  <a href={`tel:${settings.phone}`} className="font-bold text-white hover:text-amber-400">
                    {settings.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-sm">💬</span>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase">WhatsApp Support</span>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-sm">✉️</span>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase">Email Enquiries</span>
                  <a href={`mailto:${settings.email}`} className="font-bold text-white hover:text-amber-400">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar & Trust Badges */}
        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} <span className="text-slate-300 font-bold">{settings.storeName}</span>. All Rights Reserved. Sivakasi, Tamil Nadu, India.
          </div>
          <div className="flex items-center space-x-3 text-slate-400 font-medium">
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">💳 Razorpay Secured</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">📲 UPI / GPay / PhonePe</span>
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">🚚 Safe Transit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
