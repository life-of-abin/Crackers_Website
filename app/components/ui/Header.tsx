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
  const { uniqueItemCount, isMounted } = useCart();
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

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/products#categories" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-[#5B21B6] via-[#6D3FD6] to-[#7C3AED] text-white text-xs font-medium py-2 px-4 text-center tracking-wide shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="mx-auto lg:mx-0 flex items-center gap-2 font-bold text-amber-200">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F5C451] animate-ping" />
              🔥 DIWALI FESTIVE SALE IS LIVE! FREE EXPRESS SHIPPING OVER ₹{settings.freeShippingThreshold.toLocaleString("en-IN")}
            </span>
            <div className="hidden lg:flex items-center space-x-6 text-white font-semibold text-xs">
              <a href="tel:9629525907" className="hover:text-[#F5C451] transition-colors">
                📞 Support: 9629525907
              </a>
              <a
                href="https://wa.me/919629525907"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition-colors flex items-center gap-1 font-bold text-emerald-300"
              >
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 md:gap-4 min-h-[44px] w-full flex-nowrap">
            
            {/* MOBILE ONLY: Hamburger Menu Button [☰] */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-800 hover:text-[#6D3FD6] active:scale-95 bg-slate-100 border border-slate-200 hover:border-purple-300 rounded-xl transition-all duration-200 flex-shrink-0 touch-target shadow-xs cursor-pointer"
              aria-label="Open navigation menu"
              title="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* BRAND LOGO: [🎆 Sivakasi Crackers] */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0 group truncate"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#6D3FD6] to-[#8B5CF6] flex items-center justify-center text-white text-base sm:text-lg font-black shadow-md">
                🪔
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-black tracking-tight text-slate-900 font-display group-hover:text-[#6D3FD6] transition-colors uppercase leading-none truncate">
                {settings.storeName}
              </span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : link.href.includes("#")
                    ? pathname.startsWith("/products")
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isActive
                        ? "bg-purple-50 text-[#6D3FD6] border border-purple-200"
                        : "text-slate-700 hover:text-[#6D3FD6] hover:bg-slate-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT CONTROLS: SEARCH BAR + CART */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto lg:ml-0">
              
              {/* DESKTOP FULL SEARCH BAR */}
              <div className="hidden lg:block w-56 xl:w-72">
                <LiveSearch />
              </div>

              {/* MOBILE SEARCH ICON ONLY [🔍] */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-purple-300 text-[#6D3FD6] text-sm font-bold transition-all touch-target flex-shrink-0 cursor-pointer"
                aria-label="Toggle mobile search"
                title="Search Fireworks"
              >
                🔍
              </button>

              {/* CART BUTTON [🛒] */}
              <Link
                href="/cart"
                className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#6D3FD6] hover:bg-[#5B21B6] border border-[#6D3FD6] transition-all duration-200 shadow-md touch-target flex-shrink-0"
                title="View shopping cart"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span className="hidden sm:inline font-bold">Cart</span>
                {isMounted && uniqueItemCount > 0 && (
                  <span className="inline-flex items-center justify-center bg-[#F5C451] text-[#0F172A] font-extrabold text-[10px] sm:text-[11px] min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] px-1 rounded-full leading-none shadow-xs">
                    {uniqueItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* MOBILE DEDICATED SEARCH ROW */}
          {mobileSearchOpen && (
            <div className="lg:hidden mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <LiveSearch autoFocus={mobileSearchOpen} />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold flex-shrink-0 touch-target border border-slate-200 cursor-pointer"
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER */}
      <div
        className={`fixed inset-0 z-[100] flex transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`relative z-10 w-[85vw] max-w-xs bg-white text-slate-900 border-r border-slate-200 flex flex-col shadow-2xl h-[100dvh] overflow-hidden transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <span className="font-black text-base text-slate-900 font-display uppercase tracking-tight truncate">
                {settings.storeName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors border border-slate-300 touch-target cursor-pointer"
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            <div>
              <h3 className="text-[11px] font-extrabold text-[#6D3FD6] uppercase tracking-widest mb-3 border-b border-slate-200 pb-1.5">
                Navigation
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        pathname === link.href
                          ? "bg-purple-50 text-[#6D3FD6] font-bold border border-purple-200"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <span>
                        {link.label === "Home"
                          ? "🏠"
                          : link.label === "Categories"
                          ? "📦"
                          : link.label === "Products"
                          ? "🎆"
                          : link.label === "About"
                          ? "ℹ️"
                          : "📞"}
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-extrabold text-[#6D3FD6] uppercase tracking-widest mb-3 border-b border-slate-200 pb-1.5">
                Quick Support
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/track-order"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <span>🚚</span>
                    <span>Track Order</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <span>📦</span>
                    <span>Shipping Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <a
              href="https://wa.me/919629525907"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors shadow-sm"
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
