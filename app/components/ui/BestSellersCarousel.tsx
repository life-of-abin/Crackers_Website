"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

type Product = any;

export default function BestSellersCarousel({ products }: { products: Product[] }) {
  const [activeIndex, setActiveIndex] = useState(
    products && products.length > 1 ? products.length : 0
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { items, addToCart, isMounted } = useCart();
  const [addedId, setAddedId] = useState<number | null>(null);

  // Dragging / Swiping States
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  // Initialize/Reset activeIndex if products list changes
  useEffect(() => {
    if (products && products.length > 1) {
      setActiveIndex(products.length);
    } else {
      setActiveIndex(0);
    }
    setIsTransitioning(false);
  }, [products]);

  const extendedProducts = products?.length > 1
    ? [...products, ...products, ...products]
    : products;

  // Silent index normalization at transition end
  const handleTransitionEnd = () => {
    if (!products || products.length <= 1) return;

    const N = products.length;
    if (activeIndex >= 2 * N) {
      setIsTransitioning(false);
      setActiveIndex(activeIndex - N);
    } else if (activeIndex < N) {
      setIsTransitioning(false);
      setActiveIndex(activeIndex + N);
    } else {
      setIsTransitioning(false);
    }
  };

  // Auto-play logic
  useEffect(() => {
    if (!products || products.length <= 1 || isHovered || isInteracting || isDragging) {
      setProgress(0);
      return;
    }

    const interval = 50;
    const totalDuration = 2000;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (interval / totalDuration) * 100;
        if (next >= 100) {
          setIsTransitioning(true);
          setActiveIndex((prevIndex) => prevIndex + 1);
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isHovered, isInteracting, isDragging, products?.length, activeIndex]);

  const nextSlide = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!products || products.length <= 1) return;
    if (isTransitioning) return;

    setIsInteracting(true);
    setProgress(0);
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);

    const timeout = setTimeout(() => setIsInteracting(false), 3000);
    return () => clearTimeout(timeout);
  };

  const prevSlide = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!products || products.length <= 1) return;
    if (isTransitioning) return;

    setIsInteracting(true);
    setProgress(0);
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);

    const timeout = setTimeout(() => setIsInteracting(false), 3000);
    return () => clearTimeout(timeout);
  };

  // Touch and Mouse Drag Handlers
  const handleDragStart = (clientX: number) => {
    if (!products || products.length <= 1) return;
    if (isTransitioning) return;

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

    const threshold = 50;
    setIsTransitioning(true);

    if (dragOffset < -threshold) {
      setActiveIndex((prev) => prev + 1);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => prev - 1);
    } else {
      setActiveIndex((prev) => prev);
    }
    setDragOffset(0);

    const timeout = setTimeout(() => setIsInteracting(false), 3000);
    return () => clearTimeout(timeout);
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

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

  if (!products || products.length === 0) {
    return (
      <div className="w-full max-w-[1000px] mx-auto p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-md">
        <div className="text-4xl">🌟</div>
        <h3 className="text-lg font-bold text-slate-900 font-display">No Best Sellers Available</h3>
        <p className="text-xs text-slate-500">Check back later for our featured premium crackers!</p>
      </div>
    );
  }

  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
    setIsHovered(false);
  };

  return (
    <div
      className="relative w-full max-w-[1000px] mx-auto group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md transition-all hover:shadow-xl hover:border-purple-300">

        {/* Carousel Tracks */}
        <div
          className={`flex ${isTransitioning && !isDragging ? 'transition-transform duration-400 ease-in-out' : ''}`}
          style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedProducts.map((product, index) => {
            const fallbackImage = `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80`;
            const isOutOfStock = product.stock <= 0;
            const packSizeText = product.packSize || product.quantity || "10 Pieces";
            const categoryName = product.category?.name || "Premium Crackers";

            return (
              <div key={`${product.id}-${index}`} className="w-full flex-shrink-0 flex flex-col sm:flex-row min-h-[260px] sm:min-h-[300px]">
                {(() => {
                  const cartItem = isMounted ? items.find((i) => i.id === product.id) : null;
                  const isInCart = Boolean(cartItem);
                  const cartQty = cartItem ? cartItem.cartQuantity : 0;

                  return (
                    <>
                      {/* Image Side (Left) */}
                      <Link href={`/products/${product.slug}`} className="relative w-full sm:w-[40%] bg-slate-50 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-slate-200">
                        <div className="relative w-full max-w-[220px] aspect-square transition-transform duration-500 group-hover:scale-105">
                          <img
                            src={product.image || fallbackImage}
                            alt={product.name}
                            className="w-full h-full object-contain drop-shadow-md"
                            loading="lazy"
                            draggable="false"
                          />
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                          <span className="bg-[#F5C451] text-amber-950 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-xs flex items-center gap-1.5">
                            <span>🌟</span> BEST SELLER
                          </span>
                          {product.badge && (
                            <span className="bg-[#6D3FD6] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-xs w-fit mt-1">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Information Side (Right) */}
                      <div className="w-full sm:w-[60%] p-6 sm:p-8 flex flex-col justify-center relative bg-white">
                        <Link href={`/products/${product.slug}`} className="block flex-grow space-y-2 relative z-10">
                          <div className="text-[10px] font-extrabold text-[#6D3FD6] tracking-widest uppercase mb-1">
                            {categoryName}
                          </div>

                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight pr-8">
                            {product.name}
                          </h3>

                          <div className="text-xs sm:text-sm font-medium text-slate-500">
                            {packSizeText}
                          </div>

                          <div className="flex items-center gap-3 pt-3">
                            <span className="text-xl sm:text-2xl font-black text-[#6D3FD6]">
                              ₹{product.price}
                            </span>
                            {Number(product.mrp) > Number(product.price) && (
                              <>
                                <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                                  ₹{product.mrp}
                                </span>
                                {product.discount && (
                                  <span className="bg-purple-100 text-[#6D3FD6] text-[10px] font-black px-1.5 py-0.5 rounded-md border border-purple-200">
                                    {product.discount} OFF
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="text-[11px] font-bold text-[#6D3FD6] flex items-center gap-1.5 pt-5">
                            <span className="animate-bounce">👆</span> Tap to view product
                          </div>
                        </Link>

                        {/* Add to Cart Overlay Button */}
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isOutOfStock}
                          className={`absolute bottom-6 right-6 z-20 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-xs transition-all cursor-pointer ${
                            isOutOfStock
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : isInCart
                              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                              : "bg-[#6D3FD6] text-white hover:bg-[#5B21B6] shadow-sm"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : isInCart ? `✓ In Cart (${cartQty})` : "Add to Cart"}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {products.length > 1 && (
          <>
            <button
              onClick={(e) => prevSlide(e)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-slate-200 bg-white/90 text-slate-800 flex items-center justify-center hover:border-purple-300 hover:text-[#6D3FD6] hover:bg-purple-50 transition-all shadow-md hidden sm:flex cursor-pointer"
              aria-label="Previous"
            >
              <span className="text-lg leading-none -mt-0.5">‹</span>
            </button>
            <button
              onClick={(e) => nextSlide(e)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-slate-200 bg-white/90 text-slate-800 flex items-center justify-center hover:border-purple-300 hover:text-[#6D3FD6] hover:bg-purple-50 transition-all shadow-md hidden sm:flex cursor-pointer"
              aria-label="Next"
            >
              <span className="text-lg leading-none -mt-0.5">›</span>
            </button>
          </>
        )}
      </div>

      {/* Pagination & Autoplay Indicator */}
      {products.length > 1 && (
        <div className="flex flex-col items-center justify-center mt-4 sm:mt-5 space-y-3">
          {/* Subtle Progress Bar */}
          <div className="w-48 h-[2px] bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6D3FD6] to-[#8B5CF6] transition-all duration-75 ease-linear"
              style={{
                width: `${progress}%`,
                opacity: (isHovered || isInteracting || isDragging) ? 0 : 1
              }}
            />
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {products.map((_, i) => {
              const isActive = (activeIndex % products.length) === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (isTransitioning) return;
                    setIsInteracting(true);
                    setProgress(0);
                    setIsTransitioning(true);
                    setActiveIndex(i + products.length);
                    setTimeout(() => setIsInteracting(false), 3000);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${isActive
                    ? "w-2 h-2 bg-[#6D3FD6] shadow-xs"
                    : "w-1.5 h-1.5 bg-slate-300 hover:bg-[#6D3FD6]"
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
