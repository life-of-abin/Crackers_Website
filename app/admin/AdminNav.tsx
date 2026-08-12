"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";

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
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0 sticky top-0 h-screen justify-between p-4">
        <div className="space-y-6">
          
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white text-lg font-black shadow">
              🪔
            </div>
            <div>
              <span className="font-black text-white text-sm uppercase tracking-tight block">
                Admin Manager
              </span>
              <span className="text-[10px] text-amber-400 font-bold block">
                Sivakasi Crackers
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-extrabold">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Admin User Footer & Storefront Link */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline px-2"
          >
            <span>🌐 View Customer Website →</span>
          </Link>

          <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <div className="truncate max-w-[120px]">
              <span className="block text-xs font-extrabold text-white truncate">{user.name}</span>
              <span className="block text-[10px] text-slate-400 truncate">{user.email}</span>
            </div>
            <button
              onClick={async () => {
                await logoutAction();
                window.location.href = "/admin/login";
              }}
              className="text-xs text-red-400 hover:text-red-300 font-bold"
              title="Logout"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
          <span className="font-extrabold text-sm uppercase">Admin Portal</span>
        </div>
        <Link href="/" target="_blank" className="text-xs font-bold text-amber-400">
          Store Front →
        </Link>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 text-slate-200 p-4 border-b border-slate-800 space-y-2 text-xs font-bold">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
