"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPaymentAccountsAction,
  savePaymentAccountAction,
  togglePaymentAccountAction,
  deletePaymentAccountAction,
} from "@/lib/actions";

export default function AdminPaymentsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    type: "UPI",
    displayName: "",
    upiId: "",
    qrImage: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
  });

  const loadAccounts = async () => {
    setLoading(true);
    const res = await getPaymentAccountsAction();
    setLoading(false);
    if (res.success && res.accounts) {
      setAccounts(res.accounts);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleEdit = (acc: any) => {
    setFormData({
      id: acc.id,
      type: acc.type,
      displayName: acc.displayName || "",
      upiId: acc.upiId || "",
      qrImage: acc.qrImage || "",
      bankName: acc.bankName || "",
      accountHolder: acc.accountHolder || "",
      accountNumber: acc.accountNumber || "",
      ifsc: acc.ifsc || "",
      branch: acc.branch || "",
    });
  };

  const handleReset = () => {
    setFormData({
      id: undefined,
      type: "UPI",
      displayName: "",
      upiId: "",
      qrImage: "",
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!formData.displayName) {
      setMessage("⚠️ Display Name is required.");
      return;
    }

    const res = await savePaymentAccountAction(formData);
    if (res.error) {
      setMessage(`⚠️ ${res.error}`);
    } else {
      setMessage("✓ Payment account saved successfully!");
      handleReset();
      loadAccounts();
    }
  };

  const handleToggle = async (id: number, currentActive: boolean) => {
    await togglePaymentAccountAction(id, !currentActive);
    loadAccounts();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this payment account?")) {
      await deletePaymentAccountAction(id);
      loadAccounts();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Admin Nav Header */}
      <header className="bg-slate-950 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black flex items-center justify-center text-sm">
            ⚙️
          </div>
          <div>
            <h1 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Admin Payment Accounts & QR Configuration
            </h1>
            <p className="text-[10px] text-slate-400">Manage UPI IDs, QR Images, and Bank Account Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-bold">
          <Link href="/admin/dashboard" className="text-amber-400 hover:underline">
            ← Dashboard
          </Link>
          <Link href="/admin/orders" className="text-slate-300 hover:text-white">
            Orders
          </Link>
          <Link href="/admin/products" className="text-slate-300 hover:text-white">
            Products
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">

        {message && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-2xl flex justify-between items-center">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-amber-400 font-black">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Accounts List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-black uppercase text-amber-400 tracking-wider">
              Configured Payment Accounts ({accounts.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
                No payment accounts configured yet.
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          acc.type === "UPI" ? "bg-amber-500/20 text-amber-300" : acc.type === "QR" ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {acc.type}
                        </span>
                        <h3 className="font-extrabold text-white text-sm">{acc.displayName}</h3>
                        {!acc.isActive && (
                          <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-900">
                            DISABLED
                          </span>
                        )}
                      </div>

                      {acc.upiId && (
                        <p className="text-xs text-amber-300 font-mono">UPI ID: {acc.upiId}</p>
                      )}

                      {acc.bankName && (
                        <p className="text-xs text-slate-300">
                          {acc.bankName} • A/C: {acc.accountNumber} • IFSC: {acc.ifsc}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <button
                        onClick={() => handleToggle(acc.id, acc.isActive)}
                        className={`px-3 py-1.5 rounded-lg border transition-colors ${
                          acc.isActive ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-emerald-950 text-emerald-300 border-emerald-800"
                        }`}
                      >
                        {acc.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleEdit(acc)}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/30"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="px-3 py-1.5 bg-red-950 text-red-400 border border-red-900 rounded-lg hover:bg-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Edit Form (1 col) */}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-black uppercase text-amber-400 tracking-wider">
              {formData.id ? "Edit Payment Account" : "Add Payment Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="UPI">UPI ID</option>
                  <option value="QR">QR Image Code</option>
                  <option value="BANK">Bank Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official HDFC UPI"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              {formData.type === "UPI" && (
                <div>
                  <label className="block text-amber-400 font-bold mb-1">UPI ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="abinesh.ece2003@okhdfcbank"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 font-mono"
                  />
                </div>
              )}

              {formData.type === "BANK" && (
                <>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="HDFC Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Sri Sivakasi Crackers"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="50100012345678"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="HDFC0001234"
                      value={formData.ifsc}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase tracking-wider"
                >
                  Save Account →
                </button>
                {formData.id && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
