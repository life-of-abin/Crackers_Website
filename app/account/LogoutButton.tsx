"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutAction();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
    >
      {loading ? "Logging out..." : "Sign Out"}
    </button>
  );
}
