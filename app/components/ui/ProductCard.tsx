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
    <div className="group relative bg-[#151A35] border border-[#292E4D] rounded-2xl overflow-hidden flex flex-col justify-between festive-card-hover shadow-lg hover:border-[#6D3FD6] hover:shadow-2xl">
      
      {/* Card Header & Media */}
      <div>
        <div className="relative aspect-4/3 bg-[#080B1A] overflow-hidden">
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
              <span className="bg-[#F5C451] text-[#080B1A] font-black text-[10px] px-2.5 py-0.5 rounded-lg shadow-md uppercase">
                {product.badge}
              </span>
            )}
          </div>

          {/* Stock Tag Overlay */}
          <div className="absolute bottom-2 right-2 z-10">
            {isOutOfStock ? (
              <span className="bg-[#080B1A]/90 backdrop-blur-md text-[#B9B8C7] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase border border-[#292E4D] shadow-sm">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="bg-[#11152E]/90 backdrop-blur-md text-[#F5C451] font-bold text-[10px] px-2.5 py-1 rounded-full border border-[#F5C451]/60 shadow animate-pulse">
                Only {product.stock} left
              </span>
            ) : (
              <span className="bg-[#080B1A]/90 backdrop-blur-md text-[#4ADE80] font-semibold text-[10px] px-2.5 py-0.5 rounded-full border border-[#4ADE80]/40 shadow-xs">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-3.5 sm:p-4 space-y-2">
          {product.category && (
            <span className="text-[10px] font-extrabold text-[#F5C451] uppercase tracking-widest block truncate">
              {product.category.name}
            </span>
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-[#FFF9EA] font-display group-hover:text-[#FFE29A] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Package Info Tag */}
          <div className="inline-flex items-center gap-1 bg-[#11152E] text-[#B9B8C7] font-semibold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md border border-[#292E4D]">
            <span>📦</span> <span>1 {unitLabel}</span> <span className="text-[#B9B8C7]/70 font-medium">({packSizeText})</span>
          </div>

          {/* Price Section */}
          <div className="pt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-[#F5C451] font-display">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-[#B9B8C7] font-medium">/ {unitLabel.toLowerCase()}</span>
            <span className="text-xs text-[#B9B8C7] line-through font-normal ml-auto">
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
              ? "bg-[#11152E] text-[#B9B8C7] cursor-not-allowed border border-[#292E4D]"
              : added
              ? "bg-[#4ADE80] text-[#080B1A] font-black scale-95"
              : "bg-gradient-to-r from-[#6D3FD6] to-[#9B6DFF] hover:from-[#9B6DFF] hover:to-[#6D3FD6] text-white hover:shadow-md active:scale-98"
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
