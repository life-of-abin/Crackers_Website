"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { StoreSettings } from "@/lib/settings";
import LiveSearch from "./LiveSearch";

interface HeaderProps {
  settings: StoreSettings;
  user?: { name: string; email: string; role: string } | null;
}

export default function Header({ settings, user }: HeaderProps) {
  const pathname = usePathname();
  const { totalItems, isMounted } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Close drawer & mobile search when route changes
  useEffect(() => {
    setDrawerOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Handle ESC key press & body scroll lock when drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setMobileSearchOpen(false);
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
              <a href="tel:9629525907" className="hover:text-amber-200 transition-colors">
                📞 Support: 9629525907
              </a>
              <a
                href="https://wa.me/919629525907"
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          {/* Main Horizontal Header Row: [ MENU ] [ SHOP BRAND ] [ SEARCH ] [ CART ] */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[40px] w-full flex-nowrap">

            {/* 1. Menu Button (Far Left - Mobile Only) */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-slate-800 hover:text-rose-600 active:scale-95 bg-slate-100/80 border border-slate-200/80 hover:border-rose-300 rounded-xl transition-all duration-200 flex-shrink-0 touch-target shadow-2xs group"
              aria-label="Open navigation menu"
              title="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 2. Shop Icon + Sivakasi Crackers Shop Name (Flexible, Truncating) */}
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 justify-start group truncate"
            >
              <span className="text-base sm:text-xl flex-shrink-0">🎆</span>
              <span className="text-xs sm:text-sm md:text-xl font-black tracking-tight text-slate-900 font-display group-hover:text-rose-700 transition-colors uppercase leading-none truncate">
                {settings.storeName}
              </span>
            </Link>

            {/* 3 & 4. Right Group Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Desktop/Tablet Live Search Input Bar (Visible directly on desktop/tablet only, hidden on mobile) */}
              <div className="hidden md:block w-48 lg:w-64">
                <LiveSearch />
              </div>

              {/* Mobile Search Icon Button (Visible on mobile only, toggles search row underneath header) */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                className="md:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-amber-100/70 border border-slate-200 hover:border-amber-400/60 text-slate-800 text-sm font-bold transition-all touch-target flex-shrink-0"
                aria-label="Toggle mobile search"
                title="Search Fireworks"
              >
                🔍
              </button>

              {/* Shopping Cart Button (Always visible) */}
              <Link
                href="/cart"
                className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 hover:border-amber-400 hover:text-slate-900 transition-all duration-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 whitespace-nowrap touch-target flex-shrink-0"
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

          {/* Mobile Dedicated Search Row (Revealed underneath header when Search Icon is clicked on mobile) */}
          {mobileSearchOpen && (
            <div className="md:hidden mt-2 pt-2 border-t border-amber-100 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <LiveSearch />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold flex-shrink-0 touch-target"
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Slide-Over Navigation Drawer (Left to Right) */}
      <div
        className={`fixed inset-0 z-[100] flex transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer Panel - Fixed to Left side, slides left to right */}
        <div
          className={`relative z-10 w-[85vw] max-w-xs bg-slate-950 text-slate-100 border-r border-amber-500/30 flex flex-col shadow-2xl h-[100dvh] overflow-hidden transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header with Close X Button */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎆</span>
              <span className="font-black text-lg text-white font-display uppercase tracking-tight truncate">
                {settings.storeName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 touch-target"
              aria-label="Close navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Scrollable Navigation Links */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            <div>
              <h3 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1.5">
                Navigation
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      pathname === "/" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"
                    }`}
                  >
                    <span>🏠</span>
                    <span>Home</span>
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
                <li>
                  <Link
                    href="/products"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      pathname.startsWith("/products") && !pathname.includes("#categories")
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "hover:bg-slate-900 hover:text-amber-300"
                    }`}
                  >
                    <span>🎆</span>
                    <span>Products</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      pathname === "/about" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"
                    }`}
                  >
                    <span>ℹ️</span>
                    <span>About</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      pathname === "/contact" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"
                    }`}
                  >
                    <span>📞</span>
                    <span>Contact</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links Section */}
            <div>
              <h3 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1.5">
                Quick Help
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/track-order"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      pathname === "/track-order" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"
                    }`}
                  >
                    <span>🚚</span>
                    <span>Track Order</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      pathname === "/faq" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"
                    }`}
                  >
                    <span>❓</span>
                    <span>FAQ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      pathname === "/shipping" ? "bg-amber-500/20 text-amber-300 font-bold" : "hover:bg-slate-900 hover:text-amber-300"
                    }`}
                  >
                    <span>📦</span>
                    <span>Shipping Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              <span>💬</span>
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
