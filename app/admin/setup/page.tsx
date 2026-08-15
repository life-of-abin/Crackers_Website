"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeAdminSetupAction } from "@/lib/actions";

export default function AdminSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("abinesh.ece2003@gmail.com");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Real-time Password Policy Validation
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isPasswordPolicyValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch;

  // Set Password & Create Admin Account
  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!isPasswordPolicyValid) {
      setError("Please ensure all password security requirements are met.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const res = await completeAdminSetupAction(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMsg(res.message || "Admin setup complete! Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#6D3FD6] selection:text-white">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-[#6D3FD6] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-purple-200 mx-auto border border-purple-300/30">
          👑
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-display leading-tight">
          SRI SIVAKASI CRACKERS
        </h1>
        <p className="text-xs font-black uppercase tracking-widest text-[#6D3FD6]">
          ADMIN INITIAL SETUP
        </p>
      </div>

      {/* Centered Light Theme Setup Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-slate-200 text-slate-900 py-8 px-6 sm:px-10 shadow-xl rounded-3xl space-y-6">

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-800 font-black cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleCompleteSetup} className="space-y-5">
            {/* Owner Email */}
            <div>
              <label htmlFor="owner-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered Owner Email *
              </label>
              <input
                id="owner-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abinesh.ece2003@gmail.com"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6] transition-all"
              />
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                Owner Mobile: 9629525907
              </span>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                New Admin Password *
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#6D3FD6] rounded-lg cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password with Eye Toggle */}
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Admin Password *
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] focus:border-[#6D3FD6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#6D3FD6] rounded-lg cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Policy Requirements */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-[11px] font-semibold">
              <span className="text-slate-600 uppercase text-[10px] font-bold block mb-1">
                Password Security Requirements:
              </span>
              <div className={hasMinLength ? "text-emerald-700 font-bold" : "text-slate-400"}>
                {hasMinLength ? "✓" : "○"} At least 12 characters
              </div>
              <div className={hasUppercase ? "text-emerald-700 font-bold" : "text-slate-400"}>
                {hasUppercase ? "✓" : "○"} At least 1 uppercase letter (A-Z)
              </div>
              <div className={hasLowercase ? "text-emerald-700 font-bold" : "text-slate-400"}>
                {hasLowercase ? "✓" : "○"} At least 1 lowercase letter (a-z)
              </div>
              <div className={hasNumber ? "text-emerald-700 font-bold" : "text-slate-400"}>
                {hasNumber ? "✓" : "○"} At least 1 number (0-9)
              </div>
              <div className={hasSpecial ? "text-emerald-700 font-bold" : "text-slate-400"}>
                {hasSpecial ? "✓" : "○"} At least 1 special character (!@#$%^&*)
              </div>
              <div className={passwordsMatch ? "text-emerald-700 font-bold" : "text-slate-400"}>
                {passwordsMatch ? "✓" : "○"} Passwords match
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordPolicyValid}
              className="w-full py-3.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-purple-200 cursor-pointer"
            >
              {loading ? "CREATE ADMIN ACCOUNT..." : "CREATE ADMIN ACCOUNT & COMPLETE SETUP →"}
            </button>
          </form>

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
