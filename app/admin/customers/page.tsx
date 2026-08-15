import React from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";

export default async function AdminCustomersPage() {
  const session = await requireAdmin();

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        select: {
          id: true,
          totalAmount: true,
          paymentStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminNav user={session}>
      <div className="space-y-6 max-w-7xl mx-auto selection:bg-[#6D3FD6] selection:text-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-widest block">
              User Directory & Customer Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Accounts ({customers.length})
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          {customers.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center font-medium">No registered customers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase">
                    <th className="pb-3">Customer Name</th>
                    <th className="pb-3">Contact Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Registered On</th>
                    <th className="pb-3">Total Orders</th>
                    <th className="pb-3 text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {customers.map((c) => {
                    const totalSpent = c.orders
                      .filter((o) => o.paymentStatus === "PAID")
                      .reduce((acc, o) => acc + Number(o.totalAmount), 0);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3.5 text-slate-600">{c.email}</td>
                        <td className="py-3.5 text-slate-600">{c.phone}</td>
                        <td className="py-3.5 text-slate-500 text-[11px]">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-3.5">
                          <span className="bg-purple-50 text-[#6D3FD6] font-black px-2.5 py-1 rounded-lg text-[10px]">
                            {c.orders.length} Orders
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-black text-slate-900">
                          ₹{totalSpent.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminNav>
  );
}
