"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminLoginAction } from "@/lib/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await adminLoginAction(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-amber-500 to-red-800 flex items-center justify-center text-white text-3xl font-black shadow-2xl mx-auto border border-amber-500/30">
          🛡️
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
          SIVAKASI CRACKERS
        </h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
          ADMIN PORTAL • SECURE MANAGEMENT ACCESS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 text-slate-100 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">

          {error && (
            <div className="p-3.5 bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold rounded-xl flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-200">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Verifying Credentials..." : "Login →"}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <Link href="/admin/setup" className="text-amber-400 hover:underline">
              Owner Initial Setup →
            </Link>
            <Link href="/" className="hover:text-white">
              Return to Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
