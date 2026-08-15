"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface OrderNotification {
  id: number;
  customerName: string;
  phone: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const STORAGE_KEY = "admin_acknowledged_order_ids";

export default function NotificationBell() {
  const [orders, setOrders] = useState<OrderNotification[]>([]);
  const [unseenOrders, setUnseenOrders] = useState<OrderNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch recent orders from server
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);

          // Calculate unseen orders based on localStorage acknowledged IDs
          const stored = localStorage.getItem(STORAGE_KEY);
          const ackedIds: number[] = stored ? JSON.parse(stored) : [];

          const unseen = data.orders.filter(
            (ord: OrderNotification) => !ackedIds.includes(ord.id)
          );
          setUnseenOrders(unseen);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notification orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 10 seconds for real-time order detection
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark unseen orders as acknowledged when opening dropdown
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && unseenOrders.length > 0) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const ackedIds: number[] = stored ? JSON.parse(stored) : [];
      const newAcked = Array.from(new Set([...ackedIds, ...orders.map((o) => o.id)]));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAcked));
      setUnseenOrders([]);
    }
  };

  const handleOrderClick = (orderId: number) => {
    setIsOpen(false);
    const stored = localStorage.getItem(STORAGE_KEY);
    const ackedIds: number[] = stored ? JSON.parse(stored) : [];
    if (!ackedIds.includes(orderId)) {
      const updated = [...ackedIds, orderId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setUnseenOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const badgeCount = unseenOrders.length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="New orders notifications"
        className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {/* Dynamic Badge Count */}
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <span className="font-black text-xs uppercase tracking-wider">
                New Order Notifications
              </span>
            </div>
            <span className="text-[10px] font-bold bg-[#6D3FD6] text-white px-2 py-0.5 rounded-full">
              {orders.length} Recent
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No orders received yet.
              </div>
            ) : (
              orders.map((ord) => (
                <Link
                  key={ord.id}
                  href={`/admin/orders/${ord.id}`}
                  onClick={() => handleOrderClick(ord.id)}
                  className="block p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-[#6D3FD6]">
                          Order #{ord.id}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-black rounded uppercase bg-amber-100 text-amber-800">
                          {ord.orderStatus}
                        </span>
                      </div>
                      <span className="block text-xs font-bold text-slate-800 mt-0.5">
                        {ord.customerName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {ord.phone} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-xs text-emerald-700 block">
                        ₹{ord.totalAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {ord.paymentStatus}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#6D3FD6] hover:underline"
            >
              View All Orders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
