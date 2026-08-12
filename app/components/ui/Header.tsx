"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { StoreSettings } from "@/lib/settings";
import LiveSearch from "./LiveSearch";

interface HeaderProps {
  settings: StoreSettings;
  user?: { name: string; email: string; role: string } | null;
}

export default function Header({ settings, user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, isMounted } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Handle ESC key press & body scroll lock when drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
      }
    };

    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-xs">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-rose-950/90 to-slate-950 text-amber-200 text-xs font-medium py-2 px-4 text-center tracking-wide border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="mx-auto sm:mx-0 flex items-center gap-2 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              🔥 DIWALI FESTIVE SALE IS LIVE! FREE EXPRESS SHIPPING OVER ₹{settings.freeShippingThreshold.toLocaleString("en-IN")}
            </span>
            <div className="hidden sm:flex items-center space-x-6 text-amber-300 font-semibold">
              <span>📞 Support: {settings.phone}</span>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-bold"
              >
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* Row 1: Controls & Brand */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[40px]">

            {/* Left: Hamburger Button + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
              {/* Three-Horizontal-Line (Hamburger) Menu Button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl text-slate-800 hover:text-rose-700 bg-slate-100 hover:bg-amber-100/70 border border-slate-200 hover:border-amber-400/60 font-semibold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40 touch-target flex-shrink-0"
                aria-label="Open navigation menu drawer"
                title="Open Navigation Menu"
              >
                <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[11px]">Menu</span>
              </button>

              {/* Brand Logo & Name */}
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group min-w-0 flex-shrink truncate">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white font-black text-base sm:text-xl shadow-md gold-glow group-hover:scale-105 transition-transform flex-shrink-0">
                  🪔
                </div>
                <div className="flex flex-col min-w-0 truncate">
                  <span className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 font-display group-hover:text-rose-700 transition-colors uppercase leading-none truncate">
                    {settings.storeName}
                  </span>
                  <span className="hidden sm:block text-[9px] tracking-widest font-extrabold text-amber-600 uppercase mt-0.5 truncate">
                    Direct From Sivakasi • Genuine Crackers
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Search Bar (Desktop/Tablet) & Cart Button */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Live Search - Tablet & Desktop */}
              <div className="hidden md:block w-48 lg:w-64">
                <LiveSearch />
              </div>

              {/* Shopping Cart Button */}
              <Link
                href="/cart"
                className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 hover:border-amber-400 hover:text-slate-900 transition-all duration-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 whitespace-nowrap touch-target flex-shrink-0"
                title="View shopping cart"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 group-hover:text-rose-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span className="hidden sm:inline font-bold">Cart</span>
                {isMounted && totalItems > 0 && (
                  <span className="inline-flex items-center justify-center bg-rose-600 text-white font-extrabold text-[10px] sm:text-[11px] min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] px-1 rounded-full leading-none shadow-xs group-hover:bg-rose-700 transition-colors">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Dedicated Search Bar Row */}
          <div className="mt-2 md:hidden w-full">
            <LiveSearch />
          </div>
        </div>

      </header>

      {/* Slide-Over Responsive Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[100] flex transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop Overlay */}
        <div
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer Panel */}
        <div className={`relative z-10 w-[85vw] max-w-sm sm:w-80 bg-slate-950 text-slate-100 border-r border-amber-500/30 flex flex-col shadow-2xl h-[100dvh] overflow-hidden transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Drawer Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white font-black text-sm">
                🪔
              </div>
              <span className="font-black text-lg text-white font-display uppercase tracking-tight">
                {settings.storeName}
              </span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 touch-target"
              aria-label="Close navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">

            {/* 1. SHOP (Main Destinations) */}
            <div>
              <h3 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1.5">
                Shop
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>🏠</span>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname.startsWith("/products") ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>🎆</span>
                    <span>Products</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products#categories"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-amber-300 transition-colors"
                  >
                    <span>📦</span>
                    <span>Categories</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 2. EXPLORE */}
            <div>
              <h3 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1.5">
                Explore
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/about"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/about" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>ℹ️</span>
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/contact" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>📞</span>
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. USEFUL */}
            <div>
              <h3 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1.5">
                Useful
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/track-order"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/track-order" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>🚚</span>
                    <span>Track Order</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-amber-300 transition-colors"
                  >
                    <span>💬</span>
                    <span>Customer Support</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/shipping" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>📦</span>
                    <span>Shipping Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/faq" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>❓</span>
                    <span>FAQ</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. LEGAL */}
            <div>
              <h3 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1.5">
                Legal
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/privacy"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/privacy" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>🛡️</span>
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/terms" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>📜</span>
                    <span>Terms & Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund-policy"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname === "/refund-policy" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"}`}
                  >
                    <span>🔄</span>
                    <span>Refund & Cancellation</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Drawer Footer / Helpline Action */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              <span>💬</span>
              <span>WhatsApp Helpline</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
