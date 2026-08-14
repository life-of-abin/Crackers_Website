"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/lib/actions";

interface OrderUpdaterProps {
  order: {
    id: number;
    customerName: string;
    phone: string;
    email: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
    subtotal: number;
    shipping: number;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    items: {
      id: number;
      productName: string;
      quantity: number;
      price: number;
      total: number;
    }[];
  };
}

export default function AdminOrderUpdater({ order }: OrderUpdaterProps) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdateOrderStatus = async (newStatus: string) => {
    setOrderStatus(newStatus);
    setLoading(true);
    await updateOrderStatusAction(order.id, newStatus);
    setLoading(false);
    router.refresh();
  };

  const handleUpdatePaymentStatus = async (newStatus: string) => {
    setPaymentStatus(newStatus);
    setLoading(true);
    await updatePaymentStatusAction(order.id, newStatus);
    setLoading(false);
    router.refresh();
  };

  const statusList = ["PLACED", "CONFIRMED", "PROCESSING", "READY", "SHIPPED", "DELIVERED", "CANCELLED"];
  const paymentList = ["PENDING", "PAID", "FAILED", "REFUNDED"];

  return (
    <div className="space-y-6">
      
      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Order Actions</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage status and generate invoice</p>
        </div>
        <button
          onClick={() => window.open(`/admin/orders/${order.id}/invoice`, '_blank')}
          className="bg-slate-900 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        
        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
            Fulfillment Stage
          </label>
          <select
            value={orderStatus}
            onChange={(e) => handleUpdateOrderStatus(e.target.value)}
            disabled={loading}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:ring-2 focus:ring-red-600"
          >
            {statusList.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
            disabled={loading}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:ring-2 focus:ring-red-600"
          >
            {paymentList.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Customer Address Details */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Customer & Shipping Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Name</span>
            <span className="font-extrabold text-slate-900 text-sm">{order.customerName}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Phone</span>
            <a href={`tel:${order.phone}`} className="font-black text-red-700 text-sm hover:underline">
              {order.phone}
            </a>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Full Address</span>
            <p className="font-bold text-slate-800">{order.address}, {order.city}, {order.state} - {order.pincode}</p>
          </div>
        </div>
      </div>

      {/* Purchased Items Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Items Ordered ({order.items.length})
        </h3>

        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 flex justify-between">
            <span>Product Name</span>
            <span>Qty x Unit Price</span>
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{item.productName}</span>
                <span className="text-[10px] text-slate-400">ID #{item.id}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 block">{item.quantity} x ₹{item.price.toLocaleString("en-IN")}</span>
                <span className="font-black text-red-700">₹{item.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center text-sm font-black">
          <span>Total Order Value:</span>
          <span className="text-xl text-amber-400">₹{order.totalAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

    </div>
  );
}
