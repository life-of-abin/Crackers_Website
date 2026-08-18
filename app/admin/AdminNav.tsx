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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Products", href: "/admin/products", icon: "🎆" },
    { label: "Categories", href: "/admin/categories", icon: "📁" },
    { label: "Orders", href: "/admin/orders", icon: "📦" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row selection:bg-[#6D3FD6] selection:text-white">

      {/* Permanent Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-800 border-r border-slate-200 flex-shrink-0 sticky top-0 h-screen justify-between p-4 z-30 shadow-sm">
        <div className="space-y-6 flex-1 flex flex-col overflow-y-auto">

          {/* Brand Logo & Title (Enhanced Readability) */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-11 h-11 rounded-2xl bg-[#6D3FD6] text-white flex items-center justify-center text-2xl font-black shadow-md shadow-purple-200 shrink-0">
              🪔
            </div>
            <div>
              <span className="font-black text-slate-900 text-base sm:text-lg uppercase tracking-tight block leading-none">
                SRI SIVAKASI
              </span>
              <span className="font-black text-[#6D3FD6] text-base sm:text-lg uppercase tracking-tight block leading-tight mt-0.5">
                CRACKERS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-sm font-black">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? "bg-[#6D3FD6] text-white shadow-md shadow-purple-200"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Unique Prominent Logout Button Directly Below Settings Tab */}
            <button
              onClick={async () => {
                await logoutAction();
                window.location.href = "/admin/login";
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 mt-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 font-black text-sm uppercase tracking-wider transition-all shadow-xs hover:shadow cursor-pointer"
            >
              <span className="text-xl">🚪</span>
              <span>LOGOUT</span>
            </button>
          </nav>

          {/* Manage Offers Sidebar Promotional Card (Enlarged & Enhanced) */}
          <div className="mt-auto pt-4">
            <div className="bg-gradient-to-br from-amber-50 via-purple-50 to-indigo-50 border border-purple-200 p-5 rounded-2xl space-y-2.5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wider">
                <span className="text-sm">🪔</span>
                <span>Diwali Season</span>
              </div>
              <p className="font-black text-slate-900 text-sm leading-tight">
                Sale is Live!
              </p>
              <p className="text-xs text-slate-600 font-bold">
                Update store offers & discounts
              </p>
              <Link
                href="/admin/offers"
                className="mt-2.5 block w-full text-center bg-[#6D3FD6] hover:bg-[#5B21B6] text-white text-xs font-black py-2.5 rounded-xl shadow-md transition-all shadow-purple-200"
              >
                Manage Offers →
              </Link>
            </div>
          </div>

        </div>

        {/* Sidebar Footer (Clean link, no profile details) */}
        <div className="border-t border-slate-200 pt-4 mt-4 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs font-bold text-[#6D3FD6] hover:underline px-2"
          >
            <span>🌐 View Customer Website →</span>
          </Link>
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

          {/* Desktop Breadcrumb Header */}
          <div className="hidden md:block">
            <span className="text-sm font-black text-[#6D3FD6] uppercase tracking-wider block leading-tight">
              SRI SIVAKASI CRACKERS
            </span>
            <span className="text-sm font-extrabold text-slate-800 block mt-0.5">
              Admin Control Center
            </span>
          </div>

          {/* Header Right Actions: Notification Bell + Admin Profile */}
          <div className="flex items-center gap-4">

            {/* Realtime New Orders Notification Bell */}
            <NotificationBell />

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Admin Profile Identity (Interactive Dropdown on Click) */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200 focus:outline-none"
                aria-label="Admin Profile Menu"
              >
                <div className="w-9 h-9 rounded-full bg-[#6D3FD6] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-black text-slate-900 leading-tight flex items-center gap-1">
                    {user.name}
                    <svg className={`w-3 h-3 text-slate-400 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                  <span className="block text-[10px] text-[#6D3FD6] font-bold">
                    Super Admin
                  </span>
                </div>
              </button>

              {/* Profile Dropdown Menu (Only shown on click) */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                    {/* User Card Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-[#6D3FD6] text-white font-black text-sm flex items-center justify-center shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="block font-black text-slate-900 text-sm truncate">
                          {user.name}
                        </span>
                        <span className="block text-slate-500 text-[11px] truncate">
                          {user.email}
                        </span>
                        <span className="inline-block bg-purple-100 text-[#6D3FD6] font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">
                          Super Admin
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1 pt-1">
                      <Link
                        href="/"
                        target="_blank"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                      >
                        <span>🌐</span>
                        <span>View Customer Website</span>
                      </Link>
                      <button
                        onClick={async () => {
                          setProfileMenuOpen(false);
                          await logoutAction();
                          window.location.href = "/admin/login";
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        <span>🚪</span>
                        <span>Logout Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
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
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${pathname.startsWith(item.href)
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
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-extrabold border-2 border-red-200 mt-2 transition-colors cursor-pointer"
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
