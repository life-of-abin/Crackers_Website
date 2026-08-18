"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
  confirmDeliveryChargeAction,
} from "@/lib/actions";

interface OrderUpdaterProps {
  order: {
    id: number;
    invoiceNumber?: string | null;
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
    paymentMethod?: string | null;
    paymentId?: string | null;
    orderStatus: string;
    orderType: string;
    deliveryCharge: number;
    deliveryConfirmed: boolean;
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
  const [deliveryChargeInput, setDeliveryChargeInput] = useState(
    order.deliveryCharge > 0 ? String(order.deliveryCharge) : ""
  );
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(order.deliveryConfirmed);
  const [deliveryChargeAmount, setDeliveryChargeAmount] = useState(order.deliveryCharge);
  const [deliveryChargeError, setDeliveryChargeError] = useState("");
  const [deliveryChargeSuccess, setDeliveryChargeSuccess] = useState("");
  const [totalAmount, setTotalAmount] = useState(order.totalAmount);

  const isPickup = order.orderType === "PICKUP";
  const isDelivery = order.orderType === "DELIVERY" || !order.orderType;

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

  const handleConfirmDeliveryCharge = async () => {
    setDeliveryChargeError("");
    setDeliveryChargeSuccess("");
    const chargeNum = parseFloat(deliveryChargeInput);
    if (isNaN(chargeNum) || chargeNum < 0) {
      setDeliveryChargeError("Please enter a valid delivery charge amount (₹0 or more).");
      return;
    }
    setLoading(true);
    const result = await confirmDeliveryChargeAction(order.id, chargeNum);
    setLoading(false);
    if (result?.error) {
      setDeliveryChargeError(result.error);
    } else if (result?.success) {
      setDeliveryConfirmed(true);
      setDeliveryChargeAmount(chargeNum);
      setTotalAmount(result.newTotal ?? totalAmount);
      setOrderStatus("PROCESSING");
      setDeliveryChargeSuccess(`✓ Delivery charge of ₹${chargeNum.toLocaleString("en-IN")} confirmed. New total: ₹${(result.newTotal ?? totalAmount).toLocaleString("en-IN")}`);
      router.refresh();
    }
  };

  // Status options split by type
  const deliveryStatusList = [
    "AWAITING_DELIVERY_CONFIRMATION",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];
  const pickupStatusList = [
    "PROCESSING",
    "PACKED",
    "READY_FOR_PICKUP",
    "COLLECTED",
    "CANCELLED",
  ];

  const statusList = isPickup ? pickupStatusList : deliveryStatusList;
  const paymentList = ["PENDING", "PAID", "FAILED", "REFUNDED"];

  return (
    <div className="space-y-6 selection:bg-[#6D3FD6] selection:text-white">

      {/* Order Type Banner */}
      <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-extrabold ${
        isPickup
          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
          : "bg-purple-50 border-purple-300 text-purple-800"
      }`}>
        <span className="text-xl">{isPickup ? "🏪" : "🚚"}</span>
        <div>
          <span className="block font-black text-sm">
            {isPickup ? "Store Pickup Order" : "Home Delivery Order"}
          </span>
          <span className="text-[11px] font-medium opacity-70">
            {isPickup
              ? "Customer will collect from store. No delivery charge."
              : deliveryConfirmed
              ? `Delivery Charge Confirmed: ₹${deliveryChargeAmount.toLocaleString("en-IN")}`
              : "Delivery charge must be confirmed before payment/invoice."}
          </span>
        </div>
      </div>

      {/* Delivery Charge Confirmation (DELIVERY only) */}
      {isDelivery && (
        <div className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 ${
          deliveryConfirmed ? "border-emerald-200" : "border-amber-300"
        }`}>
          <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${
            deliveryConfirmed ? "text-emerald-800" : "text-amber-800"
          }`}>
            {deliveryConfirmed ? "✓ Delivery Charge Confirmed" : "⚠️ Confirm Delivery Charge First"}
          </h3>

          {!deliveryConfirmed && (
            <p className="text-xs text-amber-700 font-medium bg-amber-50 border border-amber-200 rounded-xl p-3">
              You must confirm the delivery charge before this order can proceed to payment/invoice generation.
              Once confirmed, the customer&apos;s total will be updated.
            </p>
          )}

          {deliveryConfirmed && deliveryChargeSuccess && (
            <div className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              {deliveryChargeSuccess}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Delivery Charge (₹) *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 250"
                  value={deliveryChargeInput}
                  onChange={(e) => {
                    setDeliveryChargeInput(e.target.value);
                    setDeliveryChargeError("");
                    setDeliveryChargeSuccess("");
                  }}
                  disabled={loading || deliveryConfirmed}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] disabled:opacity-50"
                />
              </div>
              {deliveryChargeError && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{deliveryChargeError}</p>
              )}
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Enter ₹0 for free delivery. Set based on destination & weight.
              </p>
            </div>

            {!deliveryConfirmed && (
              <button
                type="button"
                onClick={handleConfirmDeliveryCharge}
                disabled={loading || !deliveryChargeInput}
                className="mt-6 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>✓ Confirm Charge</span>
              </button>
            )}

            {deliveryConfirmed && (
              <div className="mt-6 px-5 py-2.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5">
                <span>✓ Charge Confirmed (₹{deliveryChargeAmount.toLocaleString("en-IN")})</span>
              </div>
            )}
          </div>

          {deliveryConfirmed && (
            <div className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between">
              <span>Updated Total Amount:</span>
              <span className="text-[#6D3FD6] font-black">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      )}

      {/* Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Order Actions</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage fulfillment status and generate invoice
          </p>
        </div>
        <button
          onClick={() => window.open(`/admin/orders/${order.id}/invoice`, "_blank")}
          disabled={isDelivery && !deliveryConfirmed}
          title={isDelivery && !deliveryConfirmed ? "Confirm delivery charge before generating invoice" : ""}
          className="bg-[#6D3FD6] hover:bg-[#5B21B6] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all shadow-md shadow-purple-200 flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Official Invoice
          {isDelivery && !deliveryConfirmed && (
            <span className="text-[10px] text-purple-300 ml-1">(confirm delivery first)</span>
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Real-Time Status Controls
        </h3>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleUpdatePaymentStatus("PAID")}
            disabled={loading || paymentStatus === "PAID"}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✓</span>
            <span>Mark Payment as PAID</span>
          </button>

          {isDelivery && (
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus("DELIVERED")}
              disabled={loading || orderStatus === "DELIVERED"}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🎉</span>
              <span>Mark as DELIVERED</span>
            </button>
          )}

          {isPickup && (
            <>
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus("READY_FOR_PICKUP")}
                disabled={loading || orderStatus === "READY_FOR_PICKUP" || orderStatus === "COLLECTED"}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🏪</span>
                <span>Mark Ready for Pickup</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus("COLLECTED")}
                disabled={loading || orderStatus === "COLLECTED"}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🎉</span>
                <span>Mark as COLLECTED</span>
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fulfillment Stage
            </label>
            <select
              value={orderStatus}
              onChange={(e) => handleUpdateOrderStatus(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-[#6D3FD6] focus:outline-none cursor-pointer"
            >
              {statusList.map((st) => (
                <option key={st} value={st}>{st.replace(/_/g, " ")}</option>
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
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-[#6D3FD6] focus:outline-none cursor-pointer"
            >
              {paymentList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customer & Payment Audit Details */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Customer & Payment Audit Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Name</span>
            <span className="font-extrabold text-slate-900 text-sm">{order.customerName}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Phone</span>
            <a href={`tel:${order.phone}`} className="font-black text-[#6D3FD6] text-sm hover:underline">
              {order.phone}
            </a>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoice Number</span>
            <span className="font-mono font-bold text-slate-800">
              {order.invoiceNumber || (isDelivery && !deliveryConfirmed ? "— (confirm delivery charge first)" : `INV-${order.id}`)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Order Type</span>
            <span className={`font-extrabold text-sm ${isPickup ? "text-emerald-700" : "text-[#6D3FD6]"}`}>
              {isPickup ? "🏪 Store Pickup" : "🚚 Home Delivery"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
            <span className="font-bold text-slate-800">{order.paymentMethod || "UPI / Online"}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Transaction / UTR ID</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {order.paymentId || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Status</span>
            <span className="font-extrabold text-emerald-700 uppercase">{order.paymentStatus}</span>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {isPickup ? "Pickup Address" : "Full Delivery Address"}
            </span>
            <p className="font-bold text-slate-800">
              {isPickup
                ? "Customer will pickup from store"
                : `${order.address}, ${order.city}, ${order.state} - ${order.pincode}`}
            </p>
          </div>
        </div>
      </div>

      {/* Purchased Items Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Items Ordered ({order.items.length})
        </h3>

        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          <div className="bg-slate-50 px-4 py-2 font-bold text-slate-700 flex justify-between">
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
                <span className="font-bold text-slate-900 block">
                  {item.quantity} x ₹{item.price.toLocaleString("en-IN")}
                </span>
                <span className="font-black text-[#6D3FD6]">₹{item.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
            <span>Subtotal:</span>
            <span className="font-bold text-slate-900">₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {isDelivery && (
            <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
              <span>Delivery Charge:</span>
              <span className={deliveryConfirmed ? "font-bold text-slate-900" : "font-bold text-amber-600"}>
                {deliveryConfirmed ? `₹${deliveryChargeAmount.toLocaleString("en-IN")}` : "⏳ Pending"}
              </span>
            </div>
          )}
          {isPickup && (
            <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
              <span>Pickup Charge:</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
          )}
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center text-sm font-black">
          <span>Total Order Value:</span>
          <div className="text-right">
            <span className="text-xl text-amber-400">₹{totalAmount.toLocaleString("en-IN")}</span>
            {isDelivery && !deliveryConfirmed && (
              <div className="text-[10px] text-amber-300 font-medium">+ delivery charge pending</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
