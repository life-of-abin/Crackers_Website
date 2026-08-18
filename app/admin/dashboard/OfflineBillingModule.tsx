"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { createOfflineBillAction } from "@/lib/actions";

export interface POSProduct {
  id: number;
  name: string;
  price: number;
  mrp: number;
  stock: number;
  packSize: string;
  categoryName?: string;
}

export interface OfflineOrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OfflineOrderRecord {
  id: number;
  offlineBillNumber: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  subtotal: number;
  discount: number;
  paymentMethod: string;
  createdAt: string;
  items: OfflineOrderItem[];
}

export interface OfflineBillingModuleProps {
  products: POSProduct[];
  offlineOrders?: OfflineOrderRecord[];
  externalDateFilter?: string;
  onBillCreated?: () => void;
}

interface CartItem {
  product: POSProduct;
  quantity: number;
}

export default function OfflineBillingModule({
  products,
  offlineOrders = [],
  externalDateFilter,
  onBillCreated,
}: OfflineBillingModuleProps) {
  // Navigation Sub-tab: "POS" vs "HISTORY"
  const [activeTab, setActiveTab] = useState<"POS" | "HISTORY">("POS");

  // Analytics Date Filter State (Uses external date filter from main dashboard header if provided)
  const [internalDateFilter, setInternalDateFilter] = useState<string>("ALL");
  const dateFilter = externalDateFilter || internalDateFilter;

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // History Search Query State
  const [historySearch, setHistorySearch] = useState("");
  
  // Recent Created Bill Modal / Receipt State
  const [createdBill, setCreatedBill] = useState<{
    orderId: number;
    offlineBillNumber: string;
    totalAmount: number;
    itemsCount: number;
  } | null>(null);

  // Filter offline orders by Date Range
  const dateFilteredOrders = useMemo(() => {
    return offlineOrders.filter((ord) => {
      if (dateFilter === "ALL") return true;

      const orderDate = new Date(ord.createdAt);
      const now = new Date();

      if (dateFilter === "TODAY") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "YESTERDAY") {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      }
      if (dateFilter === "7DAYS") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }
      if (dateFilter === "30DAYS") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      }
      if (dateFilter === "YEARLY") {
        return orderDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [offlineOrders, dateFilter]);

  // Analytics Metrics (Filtered dynamically by selected Date Range)
  const analyticsMetrics = useMemo(() => {
    const totalSales = dateFilteredOrders.reduce((acc, ord) => acc + ord.totalAmount, 0);
    const billsCount = dateFilteredOrders.length;
    const itemsCount = dateFilteredOrders.reduce(
      (acc, ord) => acc + ord.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
      0
    );
    const avgBillValue = billsCount > 0 ? totalSales / billsCount : 0;

    return {
      totalSales,
      billsCount,
      itemsCount,
      avgBillValue,
    };
  }, [dateFilteredOrders]);

  // History Search Filter
  const searchedHistoryOrders = useMemo(() => {
    if (!historySearch.trim()) return dateFilteredOrders;
    const q = historySearch.toLowerCase();
    return dateFilteredOrders.filter(
      (ord) =>
        ord.offlineBillNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.phone.includes(q)
    );
  }, [dateFilteredOrders, historySearch]);

  // Filter products for fast selection
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products.filter((p) => p.stock > 0);
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.stock > 0 &&
        (p.name.toLowerCase().includes(q) || (p.categoryName && p.categoryName.toLowerCase().includes(q)))
    );
  }, [products, search]);

  const addToCart = (product: POSProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setManualQuantity = (productId: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.max(1, Math.min(qty, item.product.stock));
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const discount = parseFloat(discountAmount) || 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (cart.length === 0) {
      setError("Please add at least one product to the cart.");
      return;
    }

    setLoading(true);

    const res = await createOfflineBillAction({
      customerName,
      phone,
      paymentMethod,
      discountAmount: discount,
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.orderId && res.offlineBillNumber) {
      setCreatedBill({
        orderId: res.orderId,
        offlineBillNumber: res.offlineBillNumber,
        totalAmount: res.totalAmount || finalTotal,
        itemsCount: cart.reduce((acc, i) => acc + i.quantity, 0),
      });
      setCart([]);
      setCustomerName("");
      setPhone("");
      setDiscountAmount("0");
      if (onBillCreated) onBillCreated();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#6D3FD6] to-indigo-700 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧾</span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">OFFLINE STORE POS & SALES ANALYTICS</h2>
          </div>
          <p className="text-xs text-purple-200 font-medium mt-1">
            Real-time stock deduction, walk-in billing, and filtered sales reports (Daily, Weekly, Monthly, Yearly).
          </p>
        </div>
      </div>

      {/* 4 Offline Analytics KPI Cards (Filtered Dynamically by Selected Date Range) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. OFFLINE SALES REVENUE */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              OFFLINE STORE SALES
            </span>
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#6D3FD6] flex items-center justify-center text-sm font-black">
              💰
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block tracking-tight">
              ₹{analyticsMetrics.totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-600 font-extrabold mt-0.5 block">
              ✓ Verified In-Store Revenue ({dateFilter})
            </span>
          </div>
        </div>

        {/* 2. STORE BILLS COUNT */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              TOTAL STORE BILLS
            </span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black">
              🧾
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-indigo-700 block tracking-tight">
              {analyticsMetrics.billsCount}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
              Walk-in Receipts Generated
            </span>
          </div>
        </div>

        {/* 3. TOTAL ITEMS SOLD */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              TOTAL UNITS SOLD
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-black">
              📦
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600 block tracking-tight">
              {analyticsMetrics.itemsCount} Pcs
            </span>
            <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
              Deducted from Shared Stock
            </span>
          </div>
        </div>

        {/* 4. AVERAGE BILL VALUE */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              AVG BILL VALUE
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black">
              📊
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600 block tracking-tight">
              ₹{analyticsMetrics.avgBillValue.toFixed(2)}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
              Per Walk-in Customer
            </span>
          </div>
        </div>
      </div>

      {/* Bill Created Success Modal */}
      {createdBill && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-md text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <h3 className="font-black text-base">Store Bill Created Successfully!</h3>
            </div>
            <p className="text-xs font-bold text-emerald-800">
              Bill Number: <span className="font-black text-emerald-950 underline">{createdBill.offlineBillNumber}</span> • Total Amount: <span className="font-black text-emerald-950">₹{createdBill.totalAmount.toFixed(2)}</span> ({createdBill.itemsCount} Pcs)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/orders/${createdBill.orderId}/invoice`}
              target="_blank"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
            >
              🖨️ Print / Download Bill
            </Link>
            <button
              onClick={() => setCreatedBill(null)}
              className="px-4 py-2.5 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("POS")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "POS"
              ? "bg-[#6D3FD6] text-white shadow-md shadow-purple-200"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          🛒 CREATE NEW STORE BILL (POS)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("HISTORY")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === "HISTORY"
              ? "bg-[#6D3FD6] text-white shadow-md shadow-purple-200"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          📋 OFFLINE BILLS HISTORY ({dateFilteredOrders.length})
        </button>
      </div>

      {/* TAB 1: POS BILLING SYSTEM */}
      {activeTab === "POS" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLUMNS: Product Search & Catalog Grid */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-black text-base sm:text-lg text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>🎆</span> Select Store Products
              </h3>
              <span className="text-xs sm:text-sm text-slate-600 font-extrabold">
                Showing {filteredProducts.length} in-stock items
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search product name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Product Grid */}
            <div className="max-h-[500px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {filteredProducts.length === 0 ? (
                <p className="col-span-full py-8 text-center text-xs text-slate-400 font-medium">
                  No matching in-stock products found.
                </p>
              ) : (
                filteredProducts.map((p) => {
                  const inCart = cart.find((i) => i.product.id === p.id);
                  const cartQty = inCart ? inCart.quantity : 0;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#6D3FD6]/40 hover:shadow-sm transition-all bg-slate-50/50 flex flex-col justify-between space-y-2 text-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                            {p.stock} left
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                          {p.packSize || "1 Box"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-black text-sm text-[#6D3FD6]">₹{p.price.toFixed(2)}</span>

                        {cartQty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-[#6D3FD6] text-white px-2 py-1 rounded-xl text-xs font-black">
                            <button
                              type="button"
                              onClick={() => updateQuantity(p.id, -1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-1">{cartQty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(p.id, 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(p)}
                            className="px-3 py-1 bg-white hover:bg-[#6D3FD6] text-[#6D3FD6] hover:text-white border border-[#6D3FD6]/30 font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            + Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: Walk-in Cart & Payment Details */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base sm:text-lg text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>🛒</span> Walk-In Customer Cart
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs sm:text-sm text-red-600 font-black hover:underline cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
                ⚠️ {error}
              </div>
            )}

            {/* Cart Items List */}
            <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 text-sm">
              {cart.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <span className="text-3xl block mb-1">🛍️</span>
                  <p className="text-slate-500 font-bold text-sm">Cart is empty.</p>
                  <p className="text-xs text-slate-400 font-medium">Click "+ Add to Cart" on products.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="truncate flex-1">
                      <span className="font-extrabold text-slate-900 text-sm block truncate">{item.product.name}</span>
                      <span className="text-xs text-slate-600 font-semibold">
                        ₹{item.product.price} × {item.quantity} = <strong className="text-slate-900 font-black">₹{(item.product.price * item.quantity).toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden text-xs font-bold shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="px-2 py-1 hover:bg-slate-100 text-slate-700 cursor-pointer border-r border-slate-200 font-extrabold"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              setManualQuantity(item.product.id, val);
                            }
                          }}
                          className="w-12 text-center py-1 font-black text-slate-900 focus:outline-none focus:bg-purple-50 focus:ring-1 focus:ring-[#6D3FD6] text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title="Enter quantity manually"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="px-2 py-1 hover:bg-slate-100 text-slate-700 cursor-pointer border-l border-slate-200 font-extrabold"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 text-base font-bold cursor-pointer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2 border-t border-slate-100">
              {/* Customer Inputs (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 text-xs uppercase tracking-wider mb-1">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 text-xs uppercase tracking-wider mb-1">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                  />
                </div>
              </div>

              {/* Payment Method & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 text-xs uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="UPI">📱 UPI / QR Code</option>
                    <option value="Card">💳 Credit / Debit Card</option>
                    <option value="Other">🏦 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 text-xs uppercase tracking-wider mb-1">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
                  />
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Items Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-black">
                    <span>Store Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-900 font-black text-sm sm:text-base pt-2 border-t border-purple-200">
                  <span>Final Amount Payable:</span>
                  <span className="text-[#6D3FD6] text-lg font-black">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full py-4 bg-[#6D3FD6] hover:bg-[#5B21B6] disabled:bg-slate-300 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md shadow-purple-200 transition-all cursor-pointer"
              >
                {loading ? "Processing Store Bill..." : `Complete Store Sale (₹${finalTotal.toFixed(2)}) →`}
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* TAB 2: OFFLINE BILLS HISTORY */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📋</span> Offline Store Bills Audit ({searchedHistoryOrders.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Filtered by: <strong className="text-[#6D3FD6]">{dateFilter}</strong>
              </span>
            </div>

            {/* History Search Bar */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search Bill #, Name or Phone..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Bills Table Container with Sticky Header & Scrollable Body */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[680px] overflow-y-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700 font-black uppercase text-xs tracking-wider sticky top-0 z-10 border-b border-slate-200 shadow-xs">
                <tr>
                  <th className="py-3.5 px-4 bg-slate-100">Bill Number</th>
                  <th className="py-3.5 px-4 bg-slate-100">Date & Time</th>
                  <th className="py-3.5 px-4 bg-slate-100">Customer Info</th>
                  <th className="py-3.5 px-4 bg-slate-100">Payment Method</th>
                  <th className="py-3.5 px-4 text-right bg-slate-100">Amount</th>
                  <th className="py-3.5 px-4 text-center bg-slate-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-extrabold text-slate-800">
                {searchedHistoryOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-bold text-sm">
                      No offline store bills found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  searchedHistoryOrders.map((bill) => (
                    <tr key={bill.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-[#6D3FD6] text-sm">
                        {bill.offlineBillNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold text-xs">
                        {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-black text-slate-900 text-sm">{bill.customerName}</span>
                        <span className="block text-xs text-slate-500 font-semibold">{bill.phone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-purple-100 text-[#6D3FD6] text-xs font-black px-2.5 py-1 rounded-lg">
                          {bill.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-base">
                        ₹{bill.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/orders/${bill.id}/invoice`}
                          target="_blank"
                          className="px-3.5 py-2 bg-white hover:bg-[#6D3FD6] text-slate-800 hover:text-white border border-slate-300 font-black text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs hover:shadow"
                        >
                          <span>🖨️</span>
                          <span>Print Bill</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
