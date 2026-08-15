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

  const fallbackImage = `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80`;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between festive-card-hover shadow-sm hover:shadow-xl hover:border-purple-300">
      
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
              <span className="bg-[#6D3FD6] text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md uppercase tracking-wider">
                {product.discount}
              </span>
            )}
            {product.badge && (
              <span className="bg-[#F5C451] text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md uppercase">
                {product.badge}
              </span>
            )}
          </div>

          {/* Stock Tag Overlay */}
          <div className="absolute bottom-2 right-2 z-10">
            {isOutOfStock ? (
              <span className="bg-white/90 backdrop-blur-md text-slate-500 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase border border-slate-200 shadow-xs">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500/95 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs animate-pulse">
                Only {product.stock} left
              </span>
            ) : (
              <span className="bg-emerald-500/95 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {product.category && (
            <span className="text-[10px] font-extrabold text-[#6D3FD6] uppercase tracking-widest block truncate">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display group-hover:text-[#6D3FD6] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Package Info Tag */}
          <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md border border-slate-200">
            <span>📦</span> <span>1 {unitLabel}</span> <span className="text-slate-500 font-medium">({packSizeText})</span>
          </div>

          {/* Price Section */}
          <div className="pt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-[#6D3FD6] font-display">
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
          className={`w-full h-10 sm:h-11 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs touch-target cursor-pointer ${
            isOutOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              : added
              ? "bg-emerald-600 text-white font-black scale-95"
              : "bg-[#6D3FD6] hover:bg-[#5B21B6] text-white hover:shadow-md active:scale-98"
          }`}
        >
          {isOutOfStock ? (
            <span>Sold Out</span>
          ) : added ? (
            <span>✓ Added!</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
