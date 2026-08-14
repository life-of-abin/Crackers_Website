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
        <span className="text-xs font-bold text-[#B9B8C7] uppercase tracking-wider font-display">
          Quantity:
        </span>
        <div className="flex items-center border border-[#292E4D] rounded-xl bg-[#11152E] overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={isOutOfStock || qty <= 1}
            className="w-10 h-10 flex items-center justify-center text-[#FFF9EA] font-bold hover:bg-[#151A35] disabled:opacity-40 transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center font-extrabold text-[#F5C451] text-sm">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock > 0 ? product.stock : 99, q + 1))}
            disabled={isOutOfStock || qty >= product.stock}
            className="w-10 h-10 flex items-center justify-center text-[#FFF9EA] font-bold hover:bg-[#151A35] disabled:opacity-40 transition-colors"
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
              ? "bg-[#11152E] text-[#B9B8C7] border border-[#292E4D] cursor-not-allowed"
              : added
              ? "bg-[#4ADE80] text-[#080B1A] font-black"
              : "bg-gradient-to-r from-[#6D3FD6] to-[#9B6DFF] hover:from-[#9B6DFF] hover:to-[#6D3FD6] text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : added ? "✓ Added to Cart!" : "🛒 Add to Cart"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] flex items-center justify-center gap-2 transition-all shadow disabled:opacity-40 gold-glow"
        >
          ⚡ Buy Now
        </button>
      </div>
    </div>
  );
}
