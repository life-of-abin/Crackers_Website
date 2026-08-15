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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-[#6D3FD6] selection:text-white">
      
      {/* Light Theme Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6D3FD6] text-white font-black flex items-center justify-center text-lg shadow-md shadow-purple-200">
            💳
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-sm uppercase tracking-wider">
              Payment Accounts & QR Configuration
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Manage UPI IDs, QR Codes, and Direct Bank Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-extrabold">
          <Link href="/admin/dashboard" className="text-[#6D3FD6] hover:underline bg-purple-50 px-3.5 py-1.5 rounded-xl border border-purple-100">
            ← Dashboard
          </Link>
          <Link href="/admin/orders" className="text-slate-600 hover:text-slate-900">
            Orders
          </Link>
          <Link href="/admin/products" className="text-slate-600 hover:text-slate-900">
            Products
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">

        {message && (
          <div className="p-4 bg-purple-50 border border-purple-200 text-[#6D3FD6] text-xs font-bold rounded-2xl flex justify-between items-center shadow-xs">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-[#6D3FD6] font-black cursor-pointer">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Accounts List (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Configured Payment Accounts ({accounts.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading payment accounts...</div>
            ) : accounts.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs shadow-sm">
                No payment accounts configured yet.
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg ${
                          acc.type === "UPI" ? "bg-purple-100 text-[#6D3FD6]" : acc.type === "QR" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {acc.type}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm">{acc.displayName}</h3>
                        {!acc.isActive && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-black">
                            DISABLED
                          </span>
                        )}
                      </div>

                      {acc.upiId && (
                        <p className="text-xs text-[#6D3FD6] font-mono font-bold">UPI ID: {acc.upiId}</p>
                      )}

                      {acc.bankName && (
                        <p className="text-xs text-slate-600 font-medium">
                          {acc.bankName} • A/C: {acc.accountNumber} • IFSC: {acc.ifsc}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-bold">
                      <button
                        onClick={() => handleToggle(acc.id, acc.isActive)}
                        className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          acc.isActive ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {acc.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleEdit(acc)}
                        className="px-3 py-1.5 bg-purple-50 text-[#6D3FD6] border border-purple-200 rounded-xl hover:bg-purple-100 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 cursor-pointer"
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              {formData.id ? "Edit Payment Account" : "Add Payment Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] cursor-pointer"
                >
                  <option value="UPI">UPI ID</option>
                  <option value="QR">QR Image Code</option>
                  <option value="BANK">Bank Account</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official HDFC UPI"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                />
              </div>

              {formData.type === "UPI" && (
                <div>
                  <label className="block text-[#6D3FD6] font-bold mb-1">UPI ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="abinesh.ece2003@okhdfcbank"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#6D3FD6] font-mono focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                  />
                </div>
              )}

              {formData.type === "BANK" && (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="HDFC Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Sri Sivakasi Crackers"
                      value={formData.accountHolder}
                      onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="50100012345678"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="HDFC0001234"
                      value={formData.ifsc}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black rounded-xl uppercase tracking-wider shadow-md shadow-purple-200 transition-all cursor-pointer"
                >
                  Save Account →
                </button>
                {formData.id && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
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
