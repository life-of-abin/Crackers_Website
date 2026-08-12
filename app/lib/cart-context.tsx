"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string | null;
  quantity: string; // package size e.g. "10 Pcs"
  unitType?: string; // BOX, PACK, BUNDLE, UNIT
  packSize?: string; // e.g. "10 Pieces"
  stock: number;
  cartQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "cartQuantity">, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  mrpTotal: number;
  savings: number;
  isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "sivakasi_crackers_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse local cart:", e);
    }
    setIsMounted(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save local cart:", e);
      }
    }
  }, [items, isMounted]);

  const addToCart = (product: Omit<CartItem, "cartQuantity">, quantityToAdd = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(
          updated[existingIndex].cartQuantity + quantityToAdd,
          product.stock > 0 ? product.stock : 999
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          cartQuantity: newQty,
        };
        return updated;
      } else {
        const initialQty = Math.min(quantityToAdd, product.stock > 0 ? product.stock : 999);
        return [...prevItems, { ...product, cartQuantity: initialQty }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxAllowed = item.stock > 0 ? item.stock : 999;
          return { ...item, cartQuantity: Math.min(newQty, maxAllowed) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.cartQuantity, 0);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.cartQuantity,
    0
  );

  const mrpTotal = items.reduce(
    (acc, item) => acc + item.mrp * item.cartQuantity,
    0
  );

  const savings = Math.max(0, mrpTotal - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        mrpTotal,
        savings,
        isMounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
