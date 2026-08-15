"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import NotificationBell from "./NotificationBell";

interface AdminNavProps {
  user: { name: string; email: string };
  children: React.ReactNode;
}

export default function AdminNav({ user, children }: AdminNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Products", href: "/admin/products", icon: "🎆" },
    { label: "Categories", href: "/admin/categories", icon: "📁" },
    { label: "Orders", href: "/admin/orders", icon: "📦" },
    { label: "Customers", href: "/admin/customers", icon: "👥" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row selection:bg-[#6D3FD6] selection:text-white">
      
      {/* Permanent Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-800 border-r border-slate-200 flex-shrink-0 sticky top-0 h-screen justify-between p-4 z-30 shadow-sm">
        <div className="space-y-6 flex-1 flex flex-col overflow-y-auto">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-[#6D3FD6] text-white flex items-center justify-center text-xl font-black shadow-md shadow-purple-200 shrink-0">
              🪔
            </div>
            <div>
              <span className="font-black text-slate-900 text-xs uppercase tracking-tight block leading-tight">
                SRI SIVAKASI
              </span>
              <span className="font-black text-[#6D3FD6] text-xs uppercase tracking-tight block leading-tight">
                CRACKERS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-extrabold">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#6D3FD6] text-white shadow-md shadow-purple-200"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Manage Offers Sidebar Promotional Card */}
          <div className="mt-auto pt-4">
            <div className="bg-gradient-to-br from-amber-50 via-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-[10px] uppercase tracking-wider">
                <span>🪔</span>
                <span>Diwali Season</span>
              </div>
              <p className="font-black text-slate-900 text-xs leading-tight">
                Sale is Live!
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Update new offers
              </p>
              <Link
                href="/admin/offers"
                className="mt-2 block w-full text-center bg-[#6D3FD6] hover:bg-[#5B21B6] text-white text-[11px] font-black py-2 rounded-xl shadow-sm transition-all shadow-purple-200"
              >
                Manage Offers
              </Link>
            </div>
          </div>

        </div>

        {/* Sidebar Footer & Functional Logout */}
        <div className="border-t border-slate-200 pt-4 mt-4 space-y-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs font-bold text-[#6D3FD6] hover:underline px-2"
          >
            <span>🌐 View Customer Website →</span>
          </Link>

          <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200">
            <div className="truncate max-w-[110px]">
              <span className="block text-xs font-extrabold text-slate-900 truncate">
                {user.name}
              </span>
              <span className="block text-[10px] text-slate-500 truncate">
                {user.email}
              </span>
            </div>
            <button
              onClick={async () => {
                await logoutAction();
                window.location.href = "/admin/login";
              }}
              className="text-xs text-red-600 hover:text-red-700 font-black uppercase bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content & Top Header Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop & Mobile Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          
          {/* Mobile Only Menu Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none"
              aria-label="Toggle navigation drawer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#6D3FD6] text-white flex items-center justify-center text-sm font-black">
                🪔
              </span>
              <span className="font-black text-xs uppercase tracking-tight text-slate-900">
                Sivakasi Crackers Admin
              </span>
            </div>
          </div>

          {/* Desktop Breadcrumb Header (No Hamburger on Desktop) */}
          <div className="hidden md:block">
            <span className="text-[10px] font-black text-[#6D3FD6] uppercase tracking-widest block">
              SRI SIVAKASI CRACKERS
            </span>
            <span className="text-xs font-bold text-slate-500">
              Admin Control Center
            </span>
          </div>

          {/* Header Right Actions: Notification Bell + Admin Profile */}
          <div className="flex items-center gap-4">
            
            {/* Realtime New Orders Notification Bell */}
            <NotificationBell />

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Admin Profile Identity */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6D3FD6] font-black text-xs flex items-center justify-center border border-purple-200">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:block text-left">
                <span className="block text-xs font-black text-slate-900 leading-tight">
                  {user.name}
                </span>
                <span className="block text-[10px] text-[#6D3FD6] font-bold">
                  Super Admin
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-white text-slate-900 border-b border-slate-200 p-4 space-y-2 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top duration-150">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  pathname.startsWith(item.href)
                    ? "bg-[#6D3FD6] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <Link
              href="/admin/offers"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-[#6D3FD6] bg-purple-50 hover:bg-purple-100 border border-purple-200 font-black mt-1"
            >
              <span>🪔</span>
              <span>Manage Offers</span>
            </Link>

            <button
              onClick={async () => {
                setMobileOpen(false);
                await logoutAction();
                window.location.href = "/admin/login";
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-extrabold border border-red-200 mt-2 transition-colors cursor-pointer"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
