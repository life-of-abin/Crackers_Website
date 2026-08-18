"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  discount: string | null;
  quantity: string;
  unitType?: string;
  packSize?: string;
  image: string | null;
  badge: string | null;
  stock: number;
  category?: { name: string; slug: string } | null;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { items, addToCart, updateQuantity, isMounted } = useCart();

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 10;
  const unitLabel = product.unitType || "BOX";
  const packSizeText = product.packSize || product.quantity || "10 Pieces";

  // Check if item is in cart
  const cartItem = isMounted ? items.find((i) => i.id === product.id) : null;
  const isInCart = Boolean(cartItem);
  const cartQty = cartItem ? cartItem.cartQuantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      mrp: Number(product.mrp),
      image: product.image,
      quantity: product.quantity,
      unitType: product.unitType,
      packSize: product.packSize,
      stock: product.stock,
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart) return;
    updateQuantity(product.id, cartQty - 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const maxAllowed = product.stock > 0 ? product.stock : 999;
    if (isInCart) {
      updateQuantity(product.id, Math.min(maxAllowed, cartQty + 1));
    } else {
      handleAdd(e);
    }
  };

  const fallbackImage = "/placeholder.png";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:border-purple-300 relative">

      {/* Card Header & Media */}
      <div>
        <div className="relative aspect-square bg-slate-50 overflow-hidden p-4 border-b border-slate-100 flex items-center justify-center">
          <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
            <img
              src={product.image || fallbackImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.discount && (
              <span className="bg-[#6D3FD6] text-white font-black text-xs px-2.5 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
                {product.discount}
              </span>
            )}
            {product.badge && (
              <span className="bg-[#F5C451] text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
                BEST SELLER
              </span>
            )}
          </div>

          {/* Stock Tag Overlay */}
          <div className="absolute bottom-2 right-2 z-10">
            {isOutOfStock ? (
              <span className="bg-white/90 backdrop-blur-md text-slate-600 font-bold text-xs px-2.5 py-1 rounded-full uppercase border border-slate-200 shadow-xs">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500/95 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs animate-pulse">
                Only {product.stock} left
              </span>
            ) : (
              <span className="bg-emerald-500/95 backdrop-blur-md text-white font-bold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {product.category && (
            <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-widest block truncate">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm sm:text-base font-black text-slate-900 font-display group-hover:text-[#6D3FD6] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Package Info Tag */}
          <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-bold text-xs px-2.5 py-1 rounded-md border border-slate-200">
            <span>📦</span> <span>1 {unitLabel}</span> <span className="text-slate-600 font-semibold">({packSizeText})</span>
          </div>

          {/* Price Section */}
          <div className="pt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-lg sm:text-xl font-black text-[#6D3FD6] font-display">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-600 font-semibold">/ {unitLabel.toLowerCase()}</span>
            <span className="text-xs sm:text-sm text-slate-400 line-through font-semibold ml-auto">
              ₹{Number(product.mrp).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Button & Interactive Quantity Controller */}
      <div className="p-3.5 sm:p-4 pt-0">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full h-10 sm:h-11 rounded-xl font-extrabold text-xs sm:text-sm bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center"
          >
            Sold Out
          </button>
        ) : isInCart ? (
          <div className="w-full h-10 sm:h-11 rounded-xl bg-emerald-600 font-extrabold text-xs sm:text-sm text-white flex items-center justify-between px-2 shadow-sm">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center font-black text-base transition-colors cursor-pointer active:scale-90"
              title="Decrease quantity (0 removes item)"
            >
              -
            </button>
            <span className="font-extrabold text-xs sm:text-sm px-1 select-none">
              In Cart ({cartQty})
            </span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center font-black text-base transition-colors cursor-pointer active:scale-90"
              title="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full h-10 sm:h-11 rounded-xl font-extrabold text-xs sm:text-sm bg-[#6D3FD6] hover:bg-[#5B21B6] text-white flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md active:scale-98 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add to Cart</span>
          </button>
        )}
      </div>

    </div>
  );
}
