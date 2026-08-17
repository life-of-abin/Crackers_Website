"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  discount?: string;
  quantity?: string;
  packSize?: string;
  image?: string | null;
  badge?: string;
  stock: number;
  category?: {
    name: string;
    slug?: string;
  };
  description?: string;
};

export default function BestSellersCarousel({ products }: { products: Product[] }) {
  const { items, addToCart, updateQuantity, isMounted } = useCart();

  const [activeIndex, setActiveIndex] = useState(
    products && products.length > 1 ? products.length : 0
  );
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dragging / Swiping States
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  // Reset activeIndex if products list changes
  useEffect(() => {
    if (products && products.length > 1) {
      setActiveIndex(products.length);
    } else {
      setActiveIndex(0);
    }
  }, [products]);

  const extendedProducts =
    products?.length > 1
      ? [...products, ...products, ...products]
      : products;

  // Auto-play logic
  useEffect(() => {
    if (!products || products.length <= 1 || isHovered || isInteracting || isDragging) {
      setProgress(0);
      return;
    }

    const interval = 50;
    const totalDuration = 2500;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (interval / totalDuration) * 100;
        if (next >= 100) {
          setIsTransitioning(true);
          setActiveIndex((prevIndex) => {
            const nextIdx = prevIndex + 1;
            const N = products.length;
            if (nextIdx >= 2 * N) {
              return nextIdx - N;
            }
            return nextIdx;
          });
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isHovered, isInteracting, isDragging, products?.length]);

  // Fast, responsive next button (no delay on rapid clicks)
  const nextSlide = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!products || products.length <= 1) return;

    setIsInteracting(true);
    setProgress(0);
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      const next = prev + 1;
      const N = products.length;
      if (next >= 2 * N) {
        return next - N;
      }
      return next;
    });

    const timeout = setTimeout(() => setIsInteracting(false), 3000);
    return () => clearTimeout(timeout);
  };

  // Fast, responsive prev button (no delay on rapid clicks)
  const prevSlide = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!products || products.length <= 1) return;

    setIsInteracting(true);
    setProgress(0);
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      const next = prev - 1;
      const N = products.length;
      if (next < N) {
        return next + N;
      }
      return next;
    });

    const timeout = setTimeout(() => setIsInteracting(false), 3000);
    return () => clearTimeout(timeout);
  };

  // Drag / Swipe Handlers
  const handleDragStart = (clientX: number) => {
    if (!products || products.length <= 1) return;

    setIsInteracting(true);
    setIsDragging(true);
    dragStartX.current = clientX;
    setDragOffset(0);
    setProgress(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStartX.current;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 40;
    setIsTransitioning(true);

    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    }
    setDragOffset(0);

    const timeout = setTimeout(() => setIsInteracting(false), 3000);
    return () => clearTimeout(timeout);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      mrp: Number(product.mrp),
      image: product.image ?? null,
      quantity: product.quantity || product.packSize || "1 Pack",
      unitType: "pack",
      packSize: product.packSize || product.quantity,
      stock: product.stock,
    });
  };

  if (!products || products.length === 0) {
    return (
      <div className="w-full max-w-[1000px] mx-auto p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 font-display">No Best Sellers Available</h3>
        <p className="text-xs text-slate-500">Check back later for our featured premium crackers!</p>
      </div>
    );
  }

  const fallbackImage = "/placeholder.png";

  return (
    <div
      className="relative w-full max-w-[1000px] mx-auto group select-none touch-pan-y"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (isDragging) handleDragEnd();
        setIsHovered(false);
      }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        handleDragStart(e.clientX);
      }}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md transition-all hover:shadow-xl hover:border-purple-300">
        {/* Carousel Track */}
        <div
          className={`flex ${
            isTransitioning && !isDragging
              ? "transition-transform duration-300 ease-out"
              : ""
          }`}
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {extendedProducts.map((product, index) => {
            const isOutOfStock = product.stock <= 0;
            const packSizeText = product.packSize || product.quantity || "10 Pieces";
            const categoryName = product.category?.name || "Premium Crackers";

            const cartItem = isMounted
              ? items.find((i) => i.id === product.id)
              : null;
            const isInCart = Boolean(cartItem);
            const cartQty = cartItem ? cartItem.cartQuantity : 0;

            return (
              <div
                key={`${product.id}-${index}`}
                className="w-full flex-shrink-0 flex flex-col sm:flex-row min-h-[260px] sm:min-h-[300px]"
              >
                {/* Left: Image Side - Direct Link to Product Page */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative w-full sm:w-[40%] bg-slate-50 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-slate-200 cursor-pointer group/img"
                >
                  <div className="relative w-full max-w-[220px] aspect-square transition-transform duration-500 group-hover/img:scale-108">
                    <img
                      src={product.image || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-md"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>

                  {/* Clean Simple BEST SELLER Tag (No stars, no extra tags) */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
                    <span className="bg-[#F5C451] text-amber-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                      BEST SELLER
                    </span>
                  </div>
                </Link>

                {/* Right: Info Side - Direct Link to Product Page */}
                <div className="w-full sm:w-[60%] p-6 sm:p-8 flex flex-col justify-between relative bg-white">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block space-y-2 relative z-10 cursor-pointer group/info"
                  >
                    <div className="text-[10px] font-extrabold text-[#6D3FD6] tracking-widest uppercase">
                      {categoryName}
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight group-hover/info:text-[#6D3FD6] transition-colors pr-8">
                      {product.name}
                    </h3>

                    <div className="text-xs sm:text-sm font-medium text-slate-500">
                      {packSizeText}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-xl sm:text-2xl font-black text-[#6D3FD6]">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {Number(product.mrp) > Number(product.price) && (
                        <>
                          <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                          {product.discount && (
                            <span className="bg-purple-100 text-[#6D3FD6] text-[10px] font-black px-1.5 py-0.5 rounded-md border border-purple-200">
                              {product.discount} OFF
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </Link>

                  {/* Add to Cart Action */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs font-bold text-[#6D3FD6] hover:underline flex items-center gap-1 transition-colors"
                    >
                      View Product →
                    </Link>

                    {isOutOfStock ? (
                      <button
                        disabled
                        className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    ) : isInCart ? (
                      <div className="rounded-xl bg-emerald-600 font-extrabold text-xs text-white flex items-center gap-1.5 p-1 shadow-sm">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateQuantity(product.id, cartQty - 1);
                          }}
                          className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center font-black text-sm transition-colors cursor-pointer active:scale-90"
                          title="Decrease quantity (0 removes item)"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs px-1 select-none">
                          In Cart ({cartQty})
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const maxAllowed = product.stock > 0 ? product.stock : 999;
                            updateQuantity(product.id, Math.min(maxAllowed, cartQty + 1));
                          }}
                          className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 flex items-center justify-center font-black text-sm transition-colors cursor-pointer active:scale-90"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-[#6D3FD6] text-white hover:bg-[#5B21B6] shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows - Fast & Super Responsive on Rapid Clicks */}
        {products.length > 1 && (
          <>
            <button
              onClick={(e) => prevSlide(e)}
              onTouchStart={(e) => prevSlide(e)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 bg-white/95 text-slate-800 flex items-center justify-center hover:border-purple-400 hover:text-[#6D3FD6] hover:bg-purple-50 active:scale-90 transition-all shadow-lg cursor-pointer select-none"
              aria-label="Previous Product"
              style={{ touchAction: "manipulation" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => nextSlide(e)}
              onTouchStart={(e) => nextSlide(e)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 bg-white/95 text-slate-800 flex items-center justify-center hover:border-purple-400 hover:text-[#6D3FD6] hover:bg-purple-50 active:scale-90 transition-all shadow-lg cursor-pointer select-none"
              aria-label="Next Product"
              style={{ touchAction: "manipulation" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {products.length > 1 && (
        <div className="flex flex-col items-center justify-center mt-4 space-y-3">
          {/* Subtle Progress Bar */}
          <div className="w-48 h-[2.5px] bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6D3FD6] to-[#8B5CF6] transition-all duration-75 ease-linear"
              style={{
                width: `${progress}%`,
                opacity: isHovered || isInteracting || isDragging ? 0 : 1,
              }}
            />
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {products.map((_, i) => {
              const isActive = activeIndex % products.length === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setIsInteracting(true);
                    setProgress(0);
                    setIsTransitioning(true);
                    setActiveIndex(i + products.length);
                    setTimeout(() => setIsInteracting(false), 3000);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? "w-6 h-2 bg-[#6D3FD6] shadow-xs"
                      : "w-2 h-2 bg-slate-300 hover:bg-[#6D3FD6]"
                  }`}
                  aria-label={`Go to product ${i + 1}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
