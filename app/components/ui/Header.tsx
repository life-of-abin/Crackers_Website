"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { StoreSettings } from "@/lib/settings";
import LiveSearch from "./LiveSearch";

interface HeaderProps {
  settings: StoreSettings;
  user?: { name: string; email: string; role: string } | null;
}

export default function Header({ settings, user }: HeaderProps) {
  const router = useRouter();
  const { totalItems, isMounted } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-200 text-xs font-semibold py-2 px-4 text-center tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="mx-auto sm:mx-0 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            🔥 DIWALI FESTIVE SALE IS LIVE! FREE EXPRESS SHIPPING OVER ₹{settings.freeShippingThreshold.toLocaleString('en-IN')}
          </span>
          <div className="hidden sm:flex items-center space-x-6 text-amber-300">
            <span>📞 Support: {settings.phone}</span>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation drawer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-red-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                🪔
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-red-950 group-hover:text-red-700 transition-colors uppercase">
                  {settings.storeName}
                </span>
                <span className="text-[10px] tracking-widest font-bold text-amber-600 uppercase">
                  Direct From Sivakasi • Genuine Crackers
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 justify-center">
            <LiveSearch />
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            
            {/* Shop Location Button (Required: Opens Google Maps link configured) */}
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
              title="Open Google Maps direction to our Sivakasi store"
            >
              <span className="text-base">📍</span>
              <div className="flex flex-col text-left">
                <span className="font-bold leading-tight">Our Shop</span>
                <span className="text-[10px] text-amber-700">Sivakasi, TN</span>
              </div>
            </a>

            {/* Track Order Button */}
            <Link
              href="/track-order"
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 px-3 py-2 rounded-xl shadow-sm transition-all"
              title="Track your order status with Order ID and Gmail"
            >
              <span className="text-sm">📦</span>
              <span className="hidden sm:inline">Track Order</span>
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {totalItems}
                </span>
              )}
            </Link>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <LiveSearch />
        </div>
      </div>

      {/* Category Navigation Bar (Desktop) */}
      <nav className="hidden md:block bg-slate-900 text-slate-200 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-semibold overflow-x-auto py-2.5">
          <div className="flex items-center space-x-6">
            <Link href="/products" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>🎆 All Crackers</span>
            </Link>
            <Link href="/category/sparklers" className="hover:text-amber-400 transition-colors">Sparklers</Link>
            <Link href="/category/rockets" className="hover:text-amber-400 transition-colors">Rockets</Link>
            <Link href="/category/gift-items" className="hover:text-amber-400 transition-colors font-bold text-amber-300">🎁 Gift Boxes</Link>
            <Link href="/category/chakkars" className="hover:text-amber-400 transition-colors">Chakkars</Link>
            <Link href="/category/flower-pots" className="hover:text-amber-400 transition-colors">Flower Pots</Link>
            <Link href="/category/atom-bomb" className="hover:text-amber-400 transition-colors">Atom Bombs</Link>
            <Link href="/category/electric-crackers" className="hover:text-amber-400 transition-colors">Electric Crackers</Link>
          </div>
          <div className="flex items-center space-x-4 text-amber-400">
            <Link href="/contact" className="hover:underline">Contact Support</Link>
            <Link href="/shipping" className="hover:underline">Shipping Policy</Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-extrabold text-sm text-slate-800 uppercase">Categories & Menu</span>
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-amber-700 flex items-center gap-1"
            >
              📍 Store Location
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-slate-50 text-slate-700">All Products</Link>
            <Link href="/category/sparklers" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-slate-50 text-slate-700">Sparklers</Link>
            <Link href="/category/rockets" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-slate-50 text-slate-700">Rockets</Link>
            <Link href="/category/gift-items" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-amber-50 text-amber-900 font-bold">🎁 Gift Boxes</Link>
            <Link href="/category/flower-pots" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-slate-50 text-slate-700">Flower Pots</Link>
            <Link href="/category/chakkars" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-slate-50 text-slate-700">Chakkars</Link>
            <Link href="/category/atom-bomb" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-slate-50 text-slate-700">Atom Bomb</Link>
            <Link href="/category/electric-crackers" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded bg-slate-50 text-slate-700">Electric Crackers</Link>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} className="font-bold text-amber-700">📦 Track Order</Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="font-bold text-red-600">🛒 View Cart</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Customer Support</Link>
          </div>
        </div>
      )}
    </header>
  );
}
