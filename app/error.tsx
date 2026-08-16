"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error tracking service
    console.error("Next.js Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-purple-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-purple-50 border border-purple-200 text-[#6D3FD6] rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xs">
          ⚠️
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Unable to Load Page
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We encountered a temporary server or connection issue while retrieving this page. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider touch-target cursor-pointer"
          >
            Reload Page
          </button>
          <Link
            href="/"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-2xl transition-all text-sm text-center touch-target flex items-center justify-center"
          >
            Go to Home
          </Link>
        </div>

        {process.env.NODE_ENV !== "production" && error?.message && (
          <div className="pt-4 border-t border-slate-100 text-left">
            <p className="text-[10px] font-mono text-rose-500 bg-rose-50 p-3 rounded-xl overflow-x-auto">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
