"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

interface ProductDetailActionsProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    mrp: number;
    image: string | null;
    quantity: string;
    stock: number;
  };
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        quantity: product.quantity,
        stock: product.stock,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        quantity: product.quantity,
        stock: product.stock,
      },
      qty
    );
    router.push("/checkout");
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Quantity Control */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Quantity:
        </span>
        <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={isOutOfStock || qty <= 1}
            className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center font-extrabold text-slate-900 text-sm">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock > 0 ? product.stock : 99, q + 1))}
            disabled={isOutOfStock || qty >= product.stock}
            className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 disabled:opacity-40 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow ${
            isOutOfStock
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center justify-center gap-2 transition-all shadow disabled:opacity-40"
        >
          ⚡ Buy Now
        </button>
      </div>
    </div>
  );
}
