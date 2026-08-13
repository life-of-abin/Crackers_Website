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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-amber-500 to-red-800 flex items-center justify-center text-white text-3xl font-black shadow-2xl mx-auto border border-amber-500/30">
          👑
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
          SIVAKASI CRACKERS
        </h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">
          ADMIN SETUP PORTAL
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

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl">
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleCompleteSetup} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Registered Owner Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abinesh.ece2003@gmail.com"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Owner Mobile: 9629525907
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                New Admin Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Confirm Admin Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Real-time Password Security Checklist */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-[11px] font-semibold">
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Password Security Requirements:</span>
              <div className={hasMinLength ? "text-emerald-400" : "text-slate-500"}>
                {hasMinLength ? "✓" : "○"} At least 12 characters
              </div>
              <div className={hasUppercase ? "text-emerald-400" : "text-slate-500"}>
                {hasUppercase ? "✓" : "○"} At least 1 uppercase letter (A-Z)
              </div>
              <div className={hasLowercase ? "text-emerald-400" : "text-slate-500"}>
                {hasLowercase ? "✓" : "○"} At least 1 lowercase letter (a-z)
              </div>
              <div className={hasNumber ? "text-emerald-400" : "text-slate-500"}>
                {hasNumber ? "✓" : "○"} At least 1 number (0-9)
              </div>
              <div className={hasSpecial ? "text-emerald-400" : "text-slate-500"}>
                {hasSpecial ? "✓" : "○"} At least 1 special character (!@#$%^&*)
              </div>
              <div className={passwordsMatch ? "text-emerald-400" : "text-slate-500"}>
                {passwordsMatch ? "✓" : "○"} Passwords match
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordPolicyValid}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Creating Admin Account..." : "Create Admin Account & Complete Setup →"}
            </button>
          </form>

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
