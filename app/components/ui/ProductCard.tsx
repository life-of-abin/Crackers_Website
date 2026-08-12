"use client";

import React, { useState } from "react";
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
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 10;
  const unitLabel = product.unitType || "BOX";
  const packSizeText = product.packSize || product.quantity || "10 Pieces";

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

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Simple placeholder image generator based on category/id if image is missing
  const fallbackImage = `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80`;

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col justify-between festive-card-hover shadow-xs hover:border-amber-400/60 hover:shadow-xl">
      
      {/* Card Header & Media */}
      <div>
        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
          <Link href={`/products/${product.slug}`}>
            <img
              src={product.image || fallbackImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.discount && (
              <span className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm uppercase tracking-wider">
                {product.discount}
              </span>
            )}
            {product.badge && (
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-sm uppercase">
                {product.badge}
              </span>
            )}
          </div>

          {/* Stock Tag Overlay */}
          <div className="absolute bottom-2 right-2 z-10">
            {isOutOfStock ? (
              <span className="bg-slate-950/90 backdrop-blur-md text-rose-400 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase border border-rose-800 shadow-sm">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-950/90 backdrop-blur-md text-amber-300 font-bold text-[10px] px-2.5 py-1 rounded-full border border-amber-500/60 shadow animate-pulse">
                Only {product.stock} {unitLabel.toLowerCase()}{product.stock > 1 ? "es" : ""} left
              </span>
            ) : (
              <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 font-semibold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-700/60 shadow-xs">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {product.category && (
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block truncate">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Package Info Tag: Pack Size / Unit Type */}
          <div className="inline-flex items-center gap-1 bg-slate-100/90 text-slate-700 font-semibold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md border border-slate-200/90">
            <span>📦</span> <span>1 {unitLabel}</span> <span className="text-slate-400 font-medium">({packSizeText})</span>
          </div>

          {/* Price Section */}
          <div className="pt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-rose-600 font-display">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">/ {unitLabel.toLowerCase()}</span>
            <span className="text-xs text-slate-400 line-through font-normal ml-auto">
              ₹{Number(product.mrp).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action */}
      <div className="p-3.5 sm:p-4 pt-0">
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`w-full h-10 sm:h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm touch-target ${
            isOutOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              : added
              ? "bg-emerald-600 text-white shadow-emerald-200 scale-95"
              : "bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white hover:shadow-md active:scale-98"
          }`}
        >
          {isOutOfStock ? (
            <span>Sold Out</span>
          ) : added ? (
            <span>✓ Added!</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
