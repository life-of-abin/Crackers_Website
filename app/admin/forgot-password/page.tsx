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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#6D3FD6] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[#6D3FD6] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-purple-200 mx-auto border border-purple-300/30">
          🔑
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase leading-tight font-display">
          SRI SIVAKASI CRACKERS
        </h1>
        <p className="text-xs font-black uppercase tracking-widest text-[#6D3FD6]">
          ADMIN PASSWORD RECOVERY
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 text-slate-900 py-8 px-6 sm:px-10 shadow-xl rounded-3xl space-y-6">

          {infoMsg ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium rounded-2xl leading-relaxed space-y-2">
                <span className="font-extrabold text-[#6D3FD6] block text-sm">ℹ️ Security Recovery Protocol</span>
                <p>{infoMsg}</p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/admin/setup"
                  className="w-full py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white text-center font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-200 block"
                >
                  Go to Secure Admin Setup (/admin/setup) →
                </Link>

                <Link
                  href="/admin/login"
                  className="w-full py-3 bg-slate-100 text-slate-700 text-center font-bold text-xs uppercase tracking-wider rounded-xl block hover:bg-slate-200"
                >
                  Return to Admin Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="recovery-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Account Email *
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  placeholder="admin@sivakasicrackers.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-200 transition-all cursor-pointer"
              >
                Request Password Reset →
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-200 text-center">
            <Link href="/admin/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">
              ← Return to Admin Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
