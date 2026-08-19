"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
  confirmDeliveryChargeAction,
  toggleOrderItemConfirmationAction,
  updateOrderItemQuantityAction,
} from "@/lib/actions";
import { formatWhatsAppNumber } from "@/lib/pincode";

interface OrderUpdaterProps {
  minOrderAmount?: number;
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
      isConfirmed?: boolean;
      removedAt?: string | null;
      productStock?: number;
      maxQuantity?: number;
    }[];
  };
}

export default function AdminOrderUpdater({ order, minOrderAmount }: OrderUpdaterProps) {
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
  const [itemsState, setItemsState] = useState(order.items);
  const [itemError, setItemError] = useState("");

  const quantityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdateItemQuantity = (itemId: number, newQty: number) => {
    if (newQty < 1 || isFrozen) return;

    const targetItem = itemsState.find((it) => it.id === itemId);
    if (targetItem && targetItem.maxQuantity !== undefined && newQty > targetItem.maxQuantity) {
      setItemError(
        `Cannot increase quantity of "${targetItem.productName}". Max available inventory stock reached (${targetItem.maxQuantity}).`
      );
      return;
    }
    setItemError("");

    const previousItemsState = [...itemsState];
    const previousTotalAmount = totalAmount;

    // Optimistically update quantity and total immediately (0ms UI latency!)
    setItemsState((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, quantity: newQty, total: Number(it.price) * newQty } : it
      )
    );

    if (quantityTimeoutRef.current) {
      clearTimeout(quantityTimeoutRef.current);
    }

    quantityTimeoutRef.current = setTimeout(async () => {
      const result = await updateOrderItemQuantityAction(itemId, newQty);

      if (result?.error) {
        setItemError(result.error);
        return;
      }

      if (result?.success && typeof result.newTotalAmount === "number") {
        setTotalAmount(result.newTotalAmount);
      }
    }, 250);
  };

  const isPickup = order.orderType === "PICKUP";
  const isDelivery = order.orderType === "DELIVERY" || !order.orderType;

  const confirmedItems = itemsState.filter((it) => it.isConfirmed !== false);
  const removedItems = itemsState.filter((it) => it.isConfirmed === false);
  const allItemsRemoved = itemsState.length > 0 && confirmedItems.length === 0;

  const confirmedSubtotal = confirmedItems.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0);
  const removedSubtotal = removedItems.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0);
  const minOrder = minOrderAmount || 500;
  const isBelowMinOrder = confirmedSubtotal > 0 && confirmedSubtotal < minOrder;

  const liveTotalAmount = confirmedSubtotal + (isDelivery && deliveryConfirmed ? deliveryChargeAmount : 0);

  const normalizedPaymentStatus = (paymentStatus || order.paymentStatus || "").toUpperCase().trim();
  const normalizedOrderStatus = (orderStatus || order.orderStatus || "").toUpperCase().trim();

  const isPaid =
    normalizedPaymentStatus === "PAID" ||
    normalizedPaymentStatus === "TEST_PAID" ||
    normalizedPaymentStatus === "SUCCESS" ||
    normalizedPaymentStatus === "COMPLETED" ||
    normalizedOrderStatus === "DELIVERED" ||
    normalizedOrderStatus === "COMPLETED";

  const isFailed = normalizedPaymentStatus === "FAILED" || normalizedOrderStatus === "FAILED" || allItemsRemoved;
  const isFrozen = isPaid || isFailed;

  const handleToggleItemConfirmation = async (itemId: number, currentConfirmed: boolean) => {
    if (isFrozen) return;
    setItemError("");
    const targetState = !currentConfirmed;

    const previousItemsState = [...itemsState];
    const previousTotalAmount = totalAmount;

    // Optimistically toggle checkbox immediately (0ms UI latency!)
    setItemsState((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, isConfirmed: targetState } : it))
    );

    const updatedItems = itemsState.map((it) =>
      it.id === itemId ? { ...it, isConfirmed: targetState } : it
    );
    const remainingConfirmed = updatedItems.filter((i) => i.isConfirmed !== false);
    const newConfirmedSubtotal = remainingConfirmed.reduce(
      (acc, i) => acc + Number(i.price) * i.quantity,
      0
    );
    const deliveryCharge = Number(order.deliveryCharge || 0);
    setTotalAmount(newConfirmedSubtotal + (remainingConfirmed.length > 0 ? deliveryCharge : 0));

    const result = await toggleOrderItemConfirmationAction(itemId, targetState);

    if (result?.error) {
      setItemsState(previousItemsState);
      setTotalAmount(previousTotalAmount);
      setItemError(result.error);
      return;
    }

    if (result?.success) {
      if (typeof result.newTotalAmount === "number") {
        setTotalAmount(result.newTotalAmount);
      }
      if (result.newOrderStatus) {
        setOrderStatus(result.newOrderStatus);
      }
    }
  };

  const handleUpdateOrderStatus = async (newStatus: string) => {
    if (isDelivery && !deliveryConfirmed) {
      setDeliveryChargeError("You must click '✓ Confirm Charge' to confirm delivery charge before updating order status.");
      return;
    }
    setOrderStatus(newStatus);
    setLoading(true);
    await updateOrderStatusAction(order.id, newStatus);
    setLoading(false);

    if (newStatus === "READY_FOR_PICKUP") {
      const phone = formatWhatsAppNumber(order.phone);
      const message = `Hello ${order.customerName},\n\nYour order *#${order.id}* is now *READY FOR PICKUP!* 🏪🎉\n\nYou can collect your packed order from our store at your convenience.\n\nThank you for shopping with us!`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } else if (newStatus === "OUT_FOR_DELIVERY") {
      const phone = formatWhatsAppNumber(order.phone);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const invoiceUrl = `${origin}/orders/${order.id}/invoice`;
      const message = `Hello ${order.customerName},\n\nYour order *#${order.id}* is *OUT FOR DELIVERY!* 🚚📦\n\nOur delivery partner will reach you soon.\n\n🧾 *View Order & Invoice:*\n${invoiceUrl}\n\nThank you for shopping with us!`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    }

    router.refresh();
  };

  const sendInvoiceViaWhatsApp = () => {
    const phone = formatWhatsAppNumber(order.phone);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const invoiceUrl = `${origin}/orders/${order.id}/invoice`;
    const message = `Hello ${order.customerName},\n\nHere is your official invoice for order *#${order.id}* 🧾\n\n🔗 *Download / View Official Invoice:*\n${invoiceUrl}\n\n*Order Summary:*\n• Payment Status: PAID ✅\n• Items Subtotal: ₹${order.subtotal.toLocaleString("en-IN")}\n• Delivery Charge: ${order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toLocaleString("en-IN")}` : "FREE"}\n• Grand Total: ₹${totalAmount.toLocaleString("en-IN")}\n\nThank you for shopping with Sri Sivakasi Crackers! 🎆`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleUpdatePaymentStatus = async (newStatus: string) => {
    if (newStatus === "PAID" && isBelowMinOrder) {
      setItemError(
        `Cannot mark order as PAID because confirmed order value (₹${confirmedSubtotal.toLocaleString("en-IN")}) is below the store minimum requirement of ₹${minOrder.toLocaleString("en-IN")}.`
      );
      return;
    }
    if (isDelivery && !deliveryConfirmed) {
      setDeliveryChargeError("You must click '✓ Confirm Charge' to confirm delivery charge before updating payment status.");
      return;
    }
    setPaymentStatus(newStatus);
    setLoading(true);
    const result = await updatePaymentStatusAction(order.id, newStatus);
    setLoading(false);

    if (result?.error) {
      setItemError(result.error);
      setPaymentStatus(order.paymentStatus);
      return;
    }

    if (newStatus === "PAID") {
      sendInvoiceViaWhatsApp();
    }

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
    "FAILED",
  ];
  const pickupStatusList = [
    "PROCESSING",
    "PACKED",
    "READY_FOR_PICKUP",
    "COLLECTED",
    "CANCELLED",
    "FAILED",
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

      {/* 1ST: Customer & Payment Audit Details */}
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
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Email</span>
            <span className="font-bold text-slate-900 text-xs truncate block" title={order.email || "N/A"}>
              {order.email || "N/A"}
            </span>
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

          {order.paymentMethod && order.paymentMethod !== "DIRECT_ORDER" && (
            <>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
                <span className="font-bold text-slate-800">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Transaction / UTR ID</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {order.paymentId || "N/A"}
                </span>
              </div>
            </>
          )}

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

      {/* 2ND: Delivery Charge Confirmation (DELIVERY only) */}
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

      {/* 3RD: Real-Time Status Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Real-Time Status Controls
        </h3>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleUpdatePaymentStatus("PAID")}
            disabled={loading || paymentStatus === "PAID" || (isDelivery && !deliveryConfirmed) || allItemsRemoved || isBelowMinOrder}
            title={
              allItemsRemoved
                ? "Disabled: Order has 0 confirmed items"
                : isBelowMinOrder
                ? `Disabled: Confirmed order subtotal (₹${confirmedSubtotal.toLocaleString("en-IN")}) is below minimum requirement of ₹${minOrder.toLocaleString("en-IN")}`
                : isDelivery && !deliveryConfirmed
                ? "Confirm delivery charge first"
                : ""
            }
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✓</span>
            <span>Mark Payment as PAID</span>
          </button>

          {isDelivery && (
            <button
              type="button"
              onClick={() => handleUpdateOrderStatus("DELIVERED")}
              disabled={loading || orderStatus === "DELIVERED" || !deliveryConfirmed || allItemsRemoved}
              title={allItemsRemoved ? "Disabled: Order has 0 confirmed items" : !deliveryConfirmed ? "Confirm delivery charge first" : ""}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
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
                disabled={loading || orderStatus === "READY_FOR_PICKUP" || orderStatus === "COLLECTED" || allItemsRemoved}
                title={allItemsRemoved ? "Disabled: Order has 0 confirmed items" : ""}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🏪</span>
                <span>Mark Ready for Pickup</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateOrderStatus("COLLECTED")}
                disabled={loading || orderStatus === "COLLECTED" || allItemsRemoved}
                title={allItemsRemoved ? "Disabled: Order has 0 confirmed items" : ""}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🎉</span>
                <span>Mark as COLLECTED</span>
              </button>
            </>
          )}
        </div>

        {/* Delivery Unconfirmed Warning Banner */}
        {isDelivery && !deliveryConfirmed && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-300 font-extrabold p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>Please click <strong>✓ Confirm Charge</strong> above to lock the delivery charge before changing payment or fulfillment status.</span>
          </div>
        )}

        {allItemsRemoved && (
          <div className="text-xs text-red-800 bg-red-50 border border-red-300 font-extrabold p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>All action buttons and status updates are disabled because this order has 0 confirmed items.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Fulfillment Stage
            </label>
            <select
              value={orderStatus}
              onChange={(e) => handleUpdateOrderStatus(e.target.value)}
              disabled={loading || (isDelivery && !deliveryConfirmed) || allItemsRemoved}
              title={allItemsRemoved ? "Disabled: Order has 0 confirmed items" : isDelivery && !deliveryConfirmed ? "Confirm delivery charge first" : ""}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-[#6D3FD6] focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
              disabled={loading || (isDelivery && !deliveryConfirmed) || allItemsRemoved}
              title={allItemsRemoved ? "Disabled: Order has 0 confirmed items" : isDelivery && !deliveryConfirmed ? "Confirm delivery charge first" : ""}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-[#6D3FD6] focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {paymentList.map((st) => (
                <option key={st} value={st} disabled={st === "PAID" && isBelowMinOrder}>
                  {st}{st === "PAID" && isBelowMinOrder ? ` (Disabled: Below ₹${minOrder} Min)` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4TH: Order Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Order Actions</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage fulfillment status and generate invoice
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={sendInvoiceViaWhatsApp}
            disabled={allItemsRemoved}
            title={allItemsRemoved ? "Disabled: Order has 0 confirmed items" : "Send Invoice via WhatsApp"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all shadow-md shadow-emerald-100 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>📱</span>
            <span>Send Invoice via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => window.open(`/admin/orders/${order.id}/invoice`, "_blank")}
            disabled={(isDelivery && !deliveryConfirmed) || (paymentStatus !== "PAID" && paymentStatus !== "TEST_PAID" && paymentStatus !== "SUCCESS") || allItemsRemoved}
            title={
              allItemsRemoved
                ? "Disabled: Order has 0 confirmed items"
                : isDelivery && !deliveryConfirmed
                ? "Confirm delivery charge before generating invoice"
                : paymentStatus !== "PAID" && paymentStatus !== "TEST_PAID" && paymentStatus !== "SUCCESS"
                ? "Mark order as PAID before generating invoice"
                : "Generate Official Invoice"
            }
            className="bg-[#6D3FD6] hover:bg-[#5B21B6] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-wide transition-all shadow-md shadow-purple-200 flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Official Invoice
            {allItemsRemoved ? (
              <span className="text-[10px] text-purple-300 ml-1">(0 items confirmed)</span>
            ) : isDelivery && !deliveryConfirmed ? (
              <span className="text-[10px] text-purple-300 ml-1">(confirm delivery first)</span>
            ) : paymentStatus !== "PAID" && paymentStatus !== "TEST_PAID" && paymentStatus !== "SUCCESS" ? (
              <span className="text-[10px] text-purple-300 ml-1">(mark as paid first)</span>
            ) : null}
          </button>
        </div>
      </div>



      {/* Purchased Items Table */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 text-xs transition-all ${
        isPaid
          ? "bg-slate-50/90 border-blue-200/80 shadow-inner relative"
          : isFailed
          ? "bg-red-50/40 border-red-200 shadow-inner relative"
          : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Item Confirmation & Removal ({confirmedItems.length}/{itemsState.length} Confirmed)
              </h3>
              {isPaid && (
                <span className="bg-blue-100 text-blue-900 border border-blue-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <span>❄️</span> FROZEN ORDER SUMMARY (PAID)
                </span>
              )}
              {isFailed && !isPaid && (
                <span className="bg-red-100 text-red-900 border border-red-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <span>🔒</span> LOCKED (FAILED)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isPaid
                ? "This order is marked as PAID. Order items and quantities are frozen and locked from edits."
                : isFailed
                ? "This order is marked as FAILED. Order items and action controls are locked."
                : "Uncheck items rejected by the customer during phone confirmation to remove them from final total & invoice."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg">
              ✓ {confirmedItems.length} Confirmed
            </span>
            {removedItems.length > 0 && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg">
                ✕ {removedItems.length} Removed
              </span>
            )}
          </div>
        </div>

        {itemError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-extrabold text-xs max-w-full overflow-hidden break-words [overflow-wrap:anywhere]">
            ⚠️ {itemError}
          </div>
        )}

        {isBelowMinOrder && (
          <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl text-amber-950 font-bold text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-extrabold uppercase tracking-wide block text-amber-800 text-[11px]">
                  Minimum Order Amount Warning (₹{minOrder.toLocaleString("en-IN")} Minimum)
                </span>
                <p className="text-slate-700 font-medium text-xs mt-0.5">
                  Confirmed products subtotal (<strong>₹{confirmedSubtotal.toLocaleString("en-IN")}</strong>) is below the store minimum order requirement of <strong>₹{minOrder.toLocaleString("en-IN")}</strong>.
                </p>
              </div>
            </div>
            <span className="bg-amber-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase whitespace-nowrap shadow-xs">
              Below ₹{minOrder} Min
            </span>
          </div>
        )}

        {isPaid && (
          <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-2xl text-blue-950 font-bold text-xs space-y-1 shadow-xs">
            <p className="text-sm font-black text-blue-900 flex items-center gap-1.5">
              <span>❄️</span> Order Summary & Items Are Locked (PAID)
            </p>
            <p className="text-blue-800 leading-relaxed">
              This order is marked as <strong>PAID</strong>. Item quantities, confirmations, and prices are frozen to prevent editing after payment verification.
            </p>
          </div>
        )}

        {allItemsRemoved && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-950 font-bold text-xs space-y-1 shadow-xs">
            <p className="text-sm font-black text-red-900 flex items-center gap-1.5">
              <span>❌</span> Order Status Automatically Set to FAILED
            </p>
            <p className="text-red-800 leading-relaxed">
              All items in this order have been unchecked. Stock has been safely returned to inventory, the unchecked item remains in the order summary with strikethrough text, and the Order Status is automatically updated to <strong>FAILED</strong>.
            </p>
          </div>
        )}

        {/* Scrollable Items Container with Freeze Effect */}
        <div className={`border rounded-2xl overflow-x-auto divide-y divide-slate-100 ${
          isFrozen ? "border-slate-300 bg-slate-100/40 cursor-not-allowed select-none" : "border-slate-200 bg-white"
        }`}>
          <div className="bg-slate-50 px-4 py-2.5 font-black text-slate-700 text-xs grid grid-cols-12 gap-2 items-center uppercase tracking-wider min-w-[600px]">
            <div className="col-span-1 text-center">Confirm</div>
            <div className="col-span-5 sm:col-span-5">Product Description</div>
            <div className="col-span-2 text-center">Packing Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-2 text-right">Confirmed Total</div>
          </div>

          <div className={`${isFrozen ? "pointer-events-none" : ""}`}>
            {itemsState.map((item) => {
              const isConfirmed = item.isConfirmed !== false;

              return (
                <div
                  key={item.id}
                  className={`p-4 grid grid-cols-12 gap-2 items-center text-xs transition-colors min-w-[600px] ${
                    isFrozen
                      ? "bg-slate-50/60 text-slate-600 opacity-90 cursor-not-allowed"
                      : isConfirmed
                      ? "hover:bg-slate-50/50"
                      : "bg-amber-50/40 opacity-80"
                  }`}
                >
                {/* Confirmation Checkbox */}
                <div className="col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleToggleItemConfirmation(item.id, isConfirmed)}
                    disabled={isFrozen}
                    title={
                      isFrozen
                        ? "Order items are frozen and cannot be modified."
                        : isConfirmed
                        ? "Click to remove item from order"
                        : "Click to restore item to order"
                    }
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                      isConfirmed
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs hover:bg-emerald-700"
                        : "bg-white border-slate-300 text-slate-400 hover:border-amber-400"
                    }`}
                  >
                    {isConfirmed ? (
                      <span className="font-black text-xs">✓</span>
                    ) : (
                      <span className="text-xs">✕</span>
                    )}
                  </button>
                </div>

                {/* Product Name & Status */}
                <div className="col-span-5 sm:col-span-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-extrabold text-sm block leading-snug ${
                        isConfirmed ? "text-slate-900" : "line-through text-slate-400"
                      }`}
                    >
                      {item.productName}
                    </span>

                    {!isConfirmed && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Removed by Customer
                      </span>
                    )}
                  </div>
                </div>

                {/* Packing Quantity with Admin Edit Controls */}
                <div className="col-span-2 text-center flex flex-col items-center justify-center gap-1">
                  {isConfirmed ? (
                    <div className={`inline-flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-xl p-1 shadow-2xs ${
                      isFrozen ? "opacity-40 pointer-events-none bg-slate-100 border-slate-200" : ""
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isFrozen}
                        title={isFrozen ? "Order is locked (PAID/FAILED). Quantities cannot be changed." : "Decrease quantity by 1"}
                        className="w-5 h-5 rounded-lg bg-white border border-purple-300 text-[#6D3FD6] hover:bg-purple-600 hover:text-white font-black text-xs flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-black text-xs text-[#6D3FD6] px-1.5 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                        disabled={isFrozen || (item.maxQuantity !== undefined && item.quantity >= item.maxQuantity)}
                        title={
                          isFrozen
                            ? "Order is locked (PAID/FAILED). Quantities cannot be changed."
                            : item.maxQuantity !== undefined && item.quantity >= item.maxQuantity
                            ? `Stock limit reached (${item.maxQuantity} max available)`
                            : "Increase quantity by 1"
                        }
                        className="w-5 h-5 rounded-lg bg-white border border-purple-300 text-[#6D3FD6] hover:bg-purple-600 hover:text-white font-black text-xs flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-bold text-xs">-</span>
                  )}
                </div>

                {/* Unit Price */}
                <div className={`col-span-2 text-right font-bold ${isConfirmed ? "text-slate-700" : "line-through text-slate-400"}`}>
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </div>

                {/* Confirmed Total */}
                <div className={`col-span-2 text-right font-black ${isConfirmed ? "text-[#6D3FD6]" : "line-through text-slate-400"}`}>
                  {isConfirmed ? `₹${(Number(item.price) * item.quantity).toLocaleString("en-IN")}` : "₹0"}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Live Subtotal Breakdown */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
            <span>Original Items Subtotal:</span>
            <span className="font-bold text-slate-800">
              ₹{itemsState.reduce((acc, i) => acc + Number(i.price) * i.quantity, 0).toLocaleString("en-IN")}
            </span>
          </div>

          {removedItems.length > 0 && (
            <div className="flex justify-between items-center text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <span>Removed Items ({removedItems.length} items):</span>
              <span>- ₹{removedSubtotal.toLocaleString("en-IN")}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-2">
              Confirmed Products Subtotal:
              {isBelowMinOrder && (
                <span className="text-[10px] bg-red-100 text-red-700 border border-red-300 font-black px-2 py-0.5 rounded-md uppercase">
                  ⚠️ Below ₹{minOrder} Min Limit
                </span>
              )}
            </span>
            <span className={`font-black ${isBelowMinOrder ? "text-red-600 text-sm" : "text-slate-900"}`}>
              ₹{confirmedSubtotal.toLocaleString("en-IN")}
            </span>
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
          <div>
            <span>Final Confirmed Order Value:</span>
            {removedItems.length > 0 && (
              <span className="text-[10px] text-amber-300 block font-normal">
                ({removedItems.length} item{removedItems.length > 1 ? "s" : ""} excluded from total & invoice)
              </span>
            )}
            {isBelowMinOrder && (
              <span className="text-[11px] text-red-400 font-extrabold block mt-0.5">
                ⚠️ Below Store Minimum Order (₹{minOrder.toLocaleString("en-IN")})
              </span>
            )}
          </div>
          <div className="text-right">
            <span className={`text-xl ${isBelowMinOrder ? "text-red-400 font-black" : "text-amber-400"}`}>
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
            {isDelivery && !deliveryConfirmed && (
              <div className="text-[10px] text-amber-300 font-medium">+ delivery charge pending</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
