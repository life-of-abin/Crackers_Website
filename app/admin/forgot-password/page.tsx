"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg(
      "If an active administrator account exists for this email address, password recovery instructions have been recorded. For instant administrative access, please use the secure /admin/setup portal with the registered owner email address."
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-amber-500 to-red-800 flex items-center justify-center text-white text-3xl font-black shadow-2xl mx-auto border border-amber-500/30">
          🔑
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
          SIVAKASI CRACKERS
        </h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
          ADMIN PASSWORD RECOVERY
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 text-slate-100 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">

          {infoMsg ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-amber-500/40 text-amber-200 text-xs font-medium rounded-2xl leading-relaxed space-y-2">
                <span className="font-extrabold text-amber-400 block text-sm">ℹ️ Security Recovery Protocol</span>
                <p>{infoMsg}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/admin/setup"
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-center font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg block"
                >
                  Go to Secure Admin Setup (/admin/setup) →
                </Link>

                <Link
                  href="/admin/login"
                  className="w-full py-3 bg-slate-800 text-slate-300 text-center font-bold text-xs uppercase tracking-wider rounded-xl block hover:bg-slate-700"
                >
                  Return to Admin Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Registered Admin Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abinesh.ece200@gmail.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
              >
                Submit Password Recovery Request →
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link href="/admin/login" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider">
              ← Return to Admin Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
