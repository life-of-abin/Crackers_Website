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
  const { items, addToCart, updateQuantity, isMounted } = useCart();
  const [localQty, setLocalQty] = useState(1);

  const isOutOfStock = product.stock <= 0;

  // Check if item is in cart
  const cartItem = isMounted ? items.find((i) => i.id === product.id) : null;
  const isInCart = Boolean(cartItem);
  const cartQty = cartItem ? cartItem.cartQuantity : 0;

  // Displayed quantity is cartQty when in cart, else localQty
  const displayQty = isInCart ? cartQty : localQty;

  const handleIncrement = () => {
    if (isOutOfStock) return;
    if (isInCart) {
      const maxAllowed = product.stock > 0 ? product.stock : 999;
      updateQuantity(product.id, Math.min(maxAllowed, cartQty + 1));
    } else {
      setLocalQty((q) => Math.min(product.stock > 0 ? product.stock : 99, q + 1));
    }
  };

  const handleDecrement = () => {
    if (isOutOfStock) return;
    if (isInCart) {
      updateQuantity(product.id, cartQty - 1);
    } else {
      setLocalQty((q) => Math.max(1, q - 1));
    }
  };

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
      isInCart ? 1 : localQty
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!isInCart) {
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
        localQty
      );
    }
    router.push("/cart");
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Quantity Control */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-display">
          Quantity:
        </span>
        <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isOutOfStock || (!isInCart && localQty <= 1)}
            className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            title={isInCart && cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
          >
            -
          </button>
          <span className="w-12 text-center font-extrabold text-[#6D3FD6] text-sm">
            {displayQty}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isOutOfStock || (product.stock > 0 && displayQty >= product.stock)}
            className="w-10 h-10 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
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
          className={`py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
            isOutOfStock
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              : isInCart
              ? "bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm"
              : "bg-[#6D3FD6] hover:bg-[#5B21B6] text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : isInCart ? `✓ In Cart (${cartQty})` : "🛒 Add to Cart"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="py-3.5 px-6 rounded-xl font-extrabold text-xs sm:text-sm bg-[#F5C451] hover:bg-amber-400 text-amber-950 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-40 cursor-pointer font-display"
        >
          ⚡ Buy Now
        </button>
      </div>
    </div>
  );
}
