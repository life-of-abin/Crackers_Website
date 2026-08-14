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
  const { addToCart } = useCart();
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
    
    // Reset interaction state after 3s
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
    
    // Reset interaction state after 3s
    const timeout = setTimeout(() => setIsInteracting(false), 3000);
    return () => clearTimeout(timeout);
  };

  // Touch and Mouse Drag Handlers
  const handleDragStart = (clientX: number) => {
    if (!products || products.length <= 1) return;
    if (isTransitioning) return; // prevent starting drag during transition normalisation

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

    const threshold = 50; // drag threshold in pixels
    setIsTransitioning(true);

    if (dragOffset < -threshold) {
      setActiveIndex((prev) => prev + 1);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => prev - 1);
    } else {
      // Force visual snap back to original index
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
    
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  if (!products || products.length === 0) {
    return (
      <div className="w-full max-w-[1000px] mx-auto p-12 rounded-2xl bg-[#151A35] border border-[#292E4D] text-center space-y-3 shadow-xl">
        <div className="text-4xl">🌟</div>
        <h3 className="text-lg font-bold text-[#FFF9EA] font-display">No Best Sellers Available</h3>
        <p className="text-xs text-[#B9B8C7]">Check back later for our featured premium crackers!</p>
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
      <div className="relative overflow-hidden rounded-2xl bg-[#151A35] border border-[#292E4D] shadow-[0_0_20px_rgba(109,63,214,0.05)] transition-all hover:shadow-[0_0_30px_rgba(109,63,214,0.15)] hover:border-[#6D3FD6]/50">
        
        {/* Subtle Firework/Glow Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F5C451]/20 via-transparent to-transparent opacity-30" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#6D3FD6]/20 via-transparent to-transparent opacity-30" />
        </div>

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
                
                {/* Image Side (Left) */}
                <Link href={`/products/${product.slug}`} className="relative w-full sm:w-[40%] bg-[#080B1A] flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-[#292E4D]">
                   <div className="relative w-full max-w-[220px] aspect-square transition-transform duration-500 group-hover:scale-105">
                     <img
                       src={product.image || fallbackImage}
                       alt={product.name}
                       className="w-full h-full object-contain drop-shadow-2xl"
                       loading="lazy"
                       draggable="false"
                     />
                   </div>
                   
                   {/* Badges */}
                   <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      <span className="bg-[#292E4D]/80 backdrop-blur-md border border-[#F5C451]/40 text-[#F5C451] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-sm shadow-md flex items-center gap-1.5">
                        <span className="text-[#F5C451]">🌟</span> BEST SELLER
                      </span>
                      {product.badge && (
                        <span className="bg-[#6D3FD6] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-md w-fit mt-1">
                           {product.badge}
                        </span>
                      )}
                   </div>
                </Link>

                {/* Information Side (Right) */}
                <div className="w-full sm:w-[60%] p-6 sm:p-8 flex flex-col justify-center relative">
                   <Link href={`/products/${product.slug}`} className="block flex-grow space-y-2 relative z-10">
                     <div className="text-[10px] font-bold text-[#9B6DFF] tracking-widest uppercase mb-1">
                       {categoryName}
                     </div>
                     
                     <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FFF9EA] tracking-tight leading-tight pr-8">
                       {product.name}
                     </h3>
                     
                     <div className="text-xs sm:text-sm font-medium text-[#B9B8C7]">
                       {packSizeText}
                     </div>

                     <div className="flex items-center gap-3 pt-3">
                       <span className="text-xl sm:text-2xl font-black text-[#F5C451]">
                         ₹{product.price}
                       </span>
                       {Number(product.mrp) > Number(product.price) && (
                         <>
                           <span className="text-xs sm:text-sm text-[#B9B8C7] line-through font-medium">
                             ₹{product.mrp}
                           </span>
                           {product.discount && (
                             <span className="bg-[#6D3FD6]/20 text-[#9B6DFF] text-[10px] font-black px-1.5 py-0.5 rounded-sm border border-[#6D3FD6]/30">
                               {product.discount} OFF
                             </span>
                           )}
                         </>
                       )}
                     </div>
                     
                     <div className="text-[11px] font-bold text-[#FFE29A] flex items-center gap-1.5 pt-5 opacity-90 group-hover:opacity-100 transition-opacity">
                       <span className="animate-bounce">👆</span> Tap to view product
                     </div>
                   </Link>
                   
                   {/* Add to Cart Overlay Button */}
                   <button 
                     onClick={(e) => handleAddToCart(e, product)}
                     disabled={isOutOfStock}
                     className={`absolute bottom-6 right-6 z-20 px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all ${
                       addedId === product.id
                         ? "bg-[#4ADE80] text-[#080B1A]"
                         : isOutOfStock
                           ? "bg-[#292E4D] text-[#B9B8C7] cursor-not-allowed"
                           : "bg-[#11152E] text-[#F5C451] border border-[#F5C451]/30 hover:bg-[#F5C451] hover:text-[#080B1A] hover:border-[#F5C451] hover:shadow-[0_0_15px_rgba(245,196,81,0.3)]"
                     }`}
                   >
                     {addedId === product.id ? "Added ✓" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                   </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Navigation Arrows */}
        {products.length > 1 && (
          <>
            <button 
              onClick={(e) => prevSlide(e)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-[#292E4D] bg-[#11152E]/80 backdrop-blur-sm text-[#FFF9EA] flex items-center justify-center hover:border-[#F5C451] hover:text-[#080B1A] hover:bg-[#F5C451] transition-all shadow-lg hidden sm:flex"
              aria-label="Previous"
            >
              <span className="text-lg leading-none -mt-1">‹</span>
            </button>
            <button 
              onClick={(e) => nextSlide(e)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full border border-[#292E4D] bg-[#11152E]/80 backdrop-blur-sm text-[#FFF9EA] flex items-center justify-center hover:border-[#F5C451] hover:text-[#080B1A] hover:bg-[#F5C451] transition-all shadow-lg hidden sm:flex"
              aria-label="Next"
            >
              <span className="text-lg leading-none -mt-1">›</span>
            </button>
          </>
        )}
      </div>

      {/* Pagination & Autoplay Indicator */}
      {products.length > 1 && (
        <div className="flex flex-col items-center justify-center mt-4 sm:mt-5 space-y-3">
          {/* Subtle Progress Bar */}
          <div className="w-48 h-[2px] bg-[#292E4D] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6D3FD6] to-[#F5C451] transition-all duration-75 ease-linear"
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
                  className={`transition-all duration-300 rounded-full ${
                    isActive 
                      ? "w-2 h-2 bg-[#F5C451] shadow-[0_0_8px_rgba(245,196,81,0.5)]" 
                      : "w-1.5 h-1.5 bg-[#292E4D] hover:bg-[#6D3FD6]"
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
