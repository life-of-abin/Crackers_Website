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
      <header className="sticky top-0 z-40 bg-[#080B1A]/95 backdrop-blur-md border-b border-[#292E4D] shadow-lg">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-[#11152E] via-[#6D3FD6]/30 to-[#11152E] text-[#FFE29A] text-xs font-medium py-2 px-4 text-center tracking-wide border-b border-[#292E4D]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="mx-auto lg:mx-0 flex items-center gap-2 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F5C451] animate-ping" />
              🔥 DIWALI FESTIVE SALE IS LIVE! FREE EXPRESS SHIPPING OVER ₹{settings.freeShippingThreshold.toLocaleString("en-IN")}
            </span>
            <div className="hidden lg:flex items-center space-x-6 text-[#FFE29A] font-semibold text-xs">
              <a href="tel:9629525907" className="hover:text-[#F5C451] transition-colors">
                📞 Support: 9629525907
              </a>
              <a
                href="https://wa.me/919629525907"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#4ADE80] transition-colors flex items-center gap-1 font-bold text-[#4ADE80]"
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
              className="lg:hidden w-9 h-9 flex items-center justify-center text-[#FFF9EA] hover:text-[#F5C451] active:scale-95 bg-[#151A35] border border-[#292E4D] hover:border-[#6D3FD6] rounded-xl transition-all duration-200 flex-shrink-0 touch-target shadow-sm"
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
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#6D3FD6] to-[#F5C451] flex items-center justify-center text-white text-base sm:text-lg font-black shadow-md gold-glow">
                🪔
              </div>
              <span className="text-xs sm:text-sm md:text-lg font-black tracking-tight text-[#FFF9EA] font-display group-hover:text-[#F5C451] transition-colors uppercase leading-none truncate">
                {settings.storeName}
              </span>
            </Link>

            {/* DESKTOP NAV LINKS: Logo | Home | Categories | Products | About | Contact | SEARCH | CART */}
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#6D3FD6]/30 text-[#F5C451] border border-[#6D3FD6]/50"
                        : "text-[#B9B8C7] hover:text-[#FFF9EA] hover:bg-[#151A35]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT CONTROLS: SEARCH BAR (Desktop) + SEARCH ICON (Mobile) + CART (Always) */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto lg:ml-0">
              
              {/* DESKTOP FULL SEARCH BAR ONLY (Hidden on Mobile) */}
              <div className="hidden lg:block w-56 xl:w-72">
                <LiveSearch />
              </div>

              {/* MOBILE SEARCH ICON ONLY [🔍] (Hidden on Desktop) */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-[#151A35] hover:bg-[#11152E] border border-[#292E4D] hover:border-[#F5C451]/60 text-[#F5C451] text-sm font-bold transition-all touch-target flex-shrink-0"
                aria-label="Toggle mobile search"
                title="Search Fireworks"
              >
                🔍
              </button>

              {/* CART BUTTON [🛒] (Always Visible) */}
              <Link
                href="/cart"
                className="group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-[#FFF9EA] bg-[#6D3FD6] hover:bg-[#9B6DFF] border border-[#6D3FD6] transition-all duration-200 shadow-md touch-target flex-shrink-0"
                title="View shopping cart"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE29A] group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span className="hidden sm:inline font-bold">Cart</span>
                {isMounted && uniqueItemCount > 0 && (
                  <span className="inline-flex items-center justify-center bg-[#F5C451] text-[#080B1A] font-extrabold text-[10px] sm:text-[11px] min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] px-1 rounded-full leading-none shadow-xs">
                    {uniqueItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* MOBILE DEDICATED SEARCH ROW (Revealed beneath header on mobile when [🔍] is clicked) */}
          {mobileSearchOpen && (
            <div className="lg:hidden mt-2 pt-2 border-t border-[#292E4D] flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <LiveSearch autoFocus={mobileSearchOpen} />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#151A35] hover:bg-[#11152E] text-[#B9B8C7] hover:text-[#FFF9EA] text-xs font-bold flex-shrink-0 touch-target border border-[#292E4D]"
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE SLIDE-OVER NAVIGATION DRAWER (Slides LEFT → RIGHT) */}
      <div
        className={`fixed inset-0 z-[100] flex transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Dark Blurred Backdrop */}
        <div
          className="fixed inset-0 bg-[#080B1A]/80 backdrop-blur-md transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer Panel - Slides Left to Right */}
        <div
          className={`relative z-10 w-[85vw] max-w-xs bg-[#080B1A] text-[#FFF9EA] border-r border-[#292E4D] flex flex-col shadow-2xl h-[100dvh] overflow-hidden transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 bg-[#11152E] border-b border-[#292E4D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪔</span>
              <span className="font-black text-base text-[#FFF9EA] font-display uppercase tracking-tight truncate">
                {settings.storeName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-xl bg-[#151A35] hover:bg-[#6D3FD6]/40 text-[#B9B8C7] hover:text-[#FFF9EA] flex items-center justify-center transition-colors border border-[#292E4D] touch-target"
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            <div>
              <h3 className="text-[11px] font-extrabold text-[#F5C451] uppercase tracking-widest mb-3 border-b border-[#292E4D] pb-1.5">
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
                          ? "bg-[#6D3FD6]/30 text-[#F5C451] font-bold border border-[#6D3FD6]/40"
                          : "hover:bg-[#151A35] text-[#B9B8C7] hover:text-[#FFF9EA]"
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
              <h3 className="text-[11px] font-extrabold text-[#F5C451] uppercase tracking-widest mb-3 border-b border-[#292E4D] pb-1.5">
                Quick Support
              </h3>
              <ul className="space-y-1.5 font-semibold text-sm">
                <li>
                  <Link
                    href="/track-order"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#B9B8C7] hover:bg-[#151A35] hover:text-[#FFF9EA] transition-colors"
                  >
                    <span>🚚</span>
                    <span>Track Order</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#B9B8C7] hover:bg-[#151A35] hover:text-[#FFF9EA] transition-colors"
                  >
                    <span>📦</span>
                    <span>Shipping Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-[#11152E] border-t border-[#292E4D]">
            <a
              href="https://wa.me/919629525907"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4ADE80] hover:bg-[#4ADE80]/90 text-[#080B1A] font-extrabold text-xs transition-colors shadow-md"
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
