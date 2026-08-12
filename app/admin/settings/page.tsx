import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import AdminNav from "../AdminNav";
import AdminSettingsForm from "./AdminSettingsForm";

export default async function AdminSettingsPage() {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const settings = await getStoreSettings();

  return (
    <AdminNav user={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-black text-red-600 uppercase tracking-widest block">
            System Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Store & Logistics Settings
          </h1>
        </div>

        <AdminSettingsForm settings={settings} />
      </div>
    </AdminNav>
  );
}
