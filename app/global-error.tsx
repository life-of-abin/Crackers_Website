"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Root Error Boundary caught exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-purple-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-purple-50 border border-purple-200 text-[#6D3FD6] rounded-2xl flex items-center justify-center text-3xl mx-auto">
            ⚡
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Application Error
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              A critical server error occurred. Click reload to refresh the application.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
