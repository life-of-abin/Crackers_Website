"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export interface StoreSettings {
  id: number;
  storeName: string;
  phone: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  whatsappNumber: string;
  minOrderAmount: number;
  flatShippingFee: number;
  freeShippingThreshold: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  storeName: "Sri Sivakasi Crackers",
  phone: "9629525907",
  email: "abinesh.ece2003@gmail.com",
  address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
  googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
  whatsappNumber: "+919629525907",
  minOrderAmount: 500,
  flatShippingFee: 100,
  freeShippingThreshold: 3000,
};

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, mrpTotal, savings, totalQuantity, uniqueItemCount, isMounted } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [minOrderAlert, setMinOrderAlert] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#6D3FD6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Shopping Cart...</p>
        </div>
      </div>
    );
  }

  const flatFee = Number(settings.flatShippingFee) || 0;
  const freeThreshold = Number(settings.freeShippingThreshold) || 0;
  const rawMin = Number(settings.minOrderAmount);
  const minOrder = !isNaN(rawMin) && rawMin >= 0 ? rawMin : 500;

  const isMinOrderMet = subtotal >= minOrder;
  const amountNeededForMinOrder = Math.max(0, minOrder - subtotal);


  const isFreeShipping = subtotal >= freeThreshold;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : flatFee;
  const grandTotal = subtotal + shippingFee;

  const amountNeededForFreeShipping = Math.max(0, freeThreshold - subtotal);


  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} />

      {/* Cart Page Banner */}
      <div className="bg-white text-slate-900 py-8 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#6D3FD6] text-xs font-bold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Shopping Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Your Festive Cart ({uniqueItemCount} {uniqueItemCount === 1 ? "Item" : "Items"})
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-sm">
            <div className="text-6xl">🛒</div>
            <h2 className="text-xl font-black text-slate-900 font-display">Your Cart is Currently Empty</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore our wide catalogue of genuine Sivakasi sparklers, rockets, and gift boxes to start your order.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-colors shadow-sm"
            >
              Explore Products Now →
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Free Shipping Progress Bar */}
            <div className="bg-white border border-purple-200 p-4 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#6D3FD6]">
                <span>🚚 Free Express Shipping Threshold</span>
                <span>{isFreeShipping ? "Unlocked! 🎉" : `Add ₹${amountNeededForFreeShipping.toFixed(0)} more`}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-[#6D3FD6] to-[#8B5CF6] h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Single Unified Order Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
                  <span>🛍️</span> Order Summary
                </h2>
                <span className="text-xs font-bold text-[#6D3FD6] bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                  {uniqueItemCount} {uniqueItemCount === 1 ? "Item" : "Items"} ({totalQuantity} Total)
                </span>
              </div>

              {/* A. Selected Items — Top Section */}
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Selected Products
                </p>
                <div className="max-h-[360px] overflow-y-auto pr-1 sm:pr-2 divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-slate-50/60 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {items.map((item) => {
                    const itemTotal = item.price * item.cartQuantity;
                    const fallbackImg = `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80`;

                    return (
                      <div key={item.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 hover:bg-slate-100/50 transition-colors">
                        
                        {/* Product Image + Details */}
                        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                          <img
                            src={item.image || fallbackImg}
                            alt={item.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-slate-200 bg-white flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <Link href={`/products/${item.slug}`} className="font-bold text-xs sm:text-sm text-slate-900 hover:text-[#6D3FD6] transition-colors line-clamp-1">
                              {item.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-semibold text-slate-800">
                                📦 {item.packSize || item.quantity || "10 Pieces"} / {item.unitType || "BOX"}
                              </span>
                              <span>₹{item.price.toLocaleString("en-IN")} / {item.unitType || "BOX"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Controls & Price */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0">
                          
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden text-xs shadow-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 touch-target focus:outline-none cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-extrabold text-[#6D3FD6] text-xs">
                              {item.cartQuantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 touch-target focus:outline-none cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right min-w-[70px]">
                            <span className="font-black text-xs sm:text-sm text-[#6D3FD6] block">
                              ₹{itemTotal.toLocaleString("en-IN")}
                            </span>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            🗑️
                          </button>

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* B. Pricing Section */}
              <div className="border-t border-slate-200 pt-5 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>MRP Total:</span>
                  <span className="line-through">₹{mrpTotal.toLocaleString("en-IN")}</span>
                </div>
                
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <span>Total Savings:</span>
                    <span>- ₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee:</span>
                  <span className={shippingFee === 0 ? "text-emerald-700 font-bold" : "font-bold text-slate-900"}>
                    {shippingFee === 0 ? "FREE" : `₹${shippingFee.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3.5 flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-black text-slate-900 uppercase">Grand Total:</span>
                  <span className="text-xl sm:text-2xl font-black text-[#6D3FD6] font-display">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* C. Minimum Purchase Alert & Proceed Button */}
              {!isMinOrderMet && (
                <div
                  className={`p-4 rounded-2xl bg-amber-50 border transition-all duration-300 ${
                    minOrderAlert
                      ? "border-amber-500 ring-2 ring-amber-400 scale-[1.02]"
                      : "border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-xs text-amber-900 mb-1">
                    <span>⚠️</span>
                    <span>Minimum Purchase Required: ₹{minOrder.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Your subtotal is <strong className="font-extrabold text-amber-950">₹{subtotal.toLocaleString("en-IN")}</strong>. Please add <strong className="font-extrabold text-amber-950">₹{amountNeededForMinOrder.toLocaleString("en-IN")}</strong> more of items to proceed to checkout.
                  </p>
                </div>
              )}

              {isMinOrderMet ? (
                <Link
                  href="/checkout"
                  className="block w-full py-4 rounded-2xl font-black text-sm text-center uppercase tracking-wider shadow-md transition-all bg-[#6D3FD6] hover:bg-[#5B21B6] text-white shadow-purple-200 touch-target"
                >
                  PROCEED TO CHECKOUT →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMinOrderAlert(true);
                    setTimeout(() => setMinOrderAlert(false), 3000);
                  }}
                  className="block w-full py-4 rounded-2xl font-black text-sm text-center uppercase tracking-wider shadow-xs transition-all bg-slate-200 hover:bg-amber-100 text-slate-500 hover:text-amber-900 border border-slate-300 hover:border-amber-300 cursor-pointer touch-target"
                >
                  PROCEED TO CHECKOUT (MIN ₹{minOrder.toLocaleString("en-IN")})
                </button>
              )}

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <button
                  onClick={clearCart}
                  className="text-slate-500 hover:text-red-600 font-semibold underline transition-colors cursor-pointer"
                >
                  Clear Entire Cart
                </button>
                <Link href="/products" className="text-[#6D3FD6] hover:underline font-bold">
                  ← Continue Shopping
                </Link>
              </div>

              <div className="text-[10px] text-slate-400 text-center space-y-1 pt-1">
                <p>🔒 256-Bit Encrypted Checkout</p>
                <p>Direct Factory Invoice & Dispatch Updates</p>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
