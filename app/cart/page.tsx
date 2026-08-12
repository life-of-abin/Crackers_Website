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
  phone: "+91 98765 43210",
  email: "support@sivasakthicrackers.com",
  address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
  googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
  whatsappNumber: "+919876543210",
  minOrderAmount: 500,
  flatShippingFee: 100,
  freeShippingThreshold: 3000,
};

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, mrpTotal, savings, totalItems, isMounted } = useCart();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      })
      .catch(console.error);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase">Loading Shopping Cart...</p>
        </div>
      </div>
    );
  }

  const minOrder = settings.minOrderAmount;
  const flatFee = settings.flatShippingFee;
  const freeThreshold = settings.freeShippingThreshold;

  const isMinOrderMet = subtotal >= minOrder;
  const isFreeShipping = subtotal >= freeThreshold;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : flatFee;
  const grandTotal = subtotal + shippingFee;

  const amountNeededForFreeShipping = Math.max(0, freeThreshold - subtotal);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} />

      {/* Cart Page Banner */}
      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Shopping Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Your Festive Cart ({totalItems} {totalItems === 1 ? "Item" : "Items"})
          </h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-sm">
            <div className="text-6xl">🛒</div>
            <h2 className="text-xl font-black text-slate-900">Your Cart is Currently Empty</h2>
            <p className="text-xs text-slate-500">
              Explore our wide catalogue of genuine Sivakasi sparklers, rockets, and gift boxes to start your order.
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-xs px-8 py-3 rounded-xl hover:from-red-700 hover:to-amber-700 transition-colors shadow"
            >
              Explore Products Now →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Items List (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Free Shipping Progress Bar */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                  <span>🚚 Free Express Shipping Threshold</span>
                  <span>{isFreeShipping ? "Unlocked! 🎉" : `Add ₹${amountNeededForFreeShipping.toFixed(0)} more`}</span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {items.map((item) => {
                  const itemTotal = item.price * item.cartQuantity;
                  const fallbackImg = `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80`;

                  return (
                    <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={item.image || fallbackImg}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 bg-slate-50 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <Link href={`/products/${item.slug}`} className="font-bold text-xs sm:text-sm text-slate-900 hover:text-red-700 line-clamp-2">
                            {item.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-800">
                              📦 Pack: {item.packSize || item.quantity || "10 Pieces"} / {item.unitType || "BOX"}
                            </span>
                            <span>₹{item.price.toLocaleString("en-IN")} / {item.unitType || "BOX"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Price Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                        
                        {/* Quantity Selector (Boxes/Packs) */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                            {item.cartQuantity} {item.unitType || "BOX"}{item.cartQuantity > 1 ? "ES" : ""}
                          </span>
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden text-xs shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                              className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 touch-target focus:outline-none focus:bg-slate-200"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-extrabold text-slate-900 text-sm">
                              {item.cartQuantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                              className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-200 touch-target focus:outline-none focus:bg-slate-200"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-20">
                          <span className="font-black text-sm text-red-700 block">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          🗑️
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  onClick={clearCart}
                  className="text-slate-500 hover:text-red-600 font-semibold underline"
                >
                  Clear Entire Cart
                </button>
                <Link href="/products" className="text-red-700 hover:underline font-bold">
                  ← Continue Shopping
                </Link>
              </div>

            </div>

            {/* Cart Summary Sidebar (1 col) */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                
                <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>MRP Total:</span>
                    <span className="line-through">₹{mrpTotal.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-extrabold bg-emerald-50 p-2 rounded-lg">
                      <span>Total Savings:</span>
                      <span>- ₹{savings.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Shipping Fee:</span>
                    <span className={shippingFee === 0 ? "text-emerald-600 font-bold" : "font-bold text-slate-900"}>
                      {shippingFee === 0 ? "FREE" : `₹${shippingFee.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-black text-slate-900">Grand Total:</span>
                    <span className="text-xl font-black text-red-700">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Minimum Order Warning */}
                {!isMinOrderMet && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs space-y-1">
                    <span className="font-bold block">⚠️ Minimum Order Required</span>
                    <p>Minimum order threshold is ₹{minOrder.toLocaleString("en-IN")}. Please add ₹{(minOrder - subtotal).toLocaleString("en-IN")} more to proceed.</p>
                  </div>
                )}

                {/* Checkout CTA Button */}
                <Link
                  href={isMinOrderMet ? "/checkout" : "#"}
                  className={`block w-full py-4 rounded-2xl font-black text-sm text-center uppercase tracking-wider shadow-lg transition-all ${
                    isMinOrderMet
                      ? "bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-amber-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Proceed to Checkout →
                </Link>

                <div className="text-[10px] text-slate-400 text-center space-y-1">
                  <p>🔒 256-Bit SSL Encrypted Checkout</p>
                  <p>Direct Factory Invoice & SMS Dispatch Updates</p>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
