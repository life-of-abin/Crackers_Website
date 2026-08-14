"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  mrp: string | number;
  discount?: string | null;
  image?: string | null;
  stock: number;
  category?: { name: string };
}

export default function LiveSearch({ autoFocus }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Autofocus input when autoFocus prop turns true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Reset focus index when results or open state change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [results, isOpen]);

  // Debounced live search effect (250ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    setHasSearched(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setLoading(false);
        if (data && data.results) {
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setLoading(false);
          setResults([]);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        e.preventDefault();
        const selectedProduct = results[focusedIndex];
        setIsOpen(false);
        router.push(`/products/${selectedProduct.slug}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search sparklers, rockets, gift boxes..."
            value={query}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-3.5 pr-20 py-2 bg-[#11152E] border border-[#292E4D] rounded-xl text-xs font-semibold text-[#FFF9EA] placeholder-[#B9B8C7] focus:outline-none focus:ring-2 focus:ring-[#F5C451] focus:border-[#F5C451] transition-all"
          />

          {/* Clear button ✕ */}
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-11 text-[#B9B8C7] hover:text-[#FFF9EA] text-xs font-extrabold px-1 py-0.5"
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-extrabold rounded-lg transition-colors flex items-center justify-center text-xs"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      </form>

      {/* Floating Live Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#151A35] rounded-xl border border-[#292E4D] shadow-2xl z-50 overflow-hidden text-xs max-h-96 overflow-y-auto">
          
          {/* Loading Indicator */}
          {loading && (
            <div className="p-4 text-center text-[#B9B8C7] font-medium flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#F5C451] border-t-transparent rounded-full animate-spin" />
              <span>Searching fireworks...</span>
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="divide-y divide-[#292E4D]">
              <div className="px-4 py-2 bg-[#11152E] font-bold text-[10px] text-[#B9B8C7] uppercase tracking-wider flex justify-between items-center">
                <span>Matching Fireworks</span>
                <span className="text-[#F5C451] font-extrabold">{results.length} found</span>
              </div>

              {results.map((product, index) => {
                const isFocused = index === focusedIndex;
                const isOutOfStock = product.stock <= 0;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 transition-colors group ${
                      isFocused ? "bg-[#292E4D] border-l-2 border-[#F5C451]" : "hover:bg-[#11152E]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#080B1A] border border-[#292E4D] flex items-center justify-center flex-shrink-0 overflow-hidden font-bold text-[#B9B8C7] text-xs">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        "🎆"
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-[#FFF9EA] group-hover:text-[#F5C451] transition-colors block truncate">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#B9B8C7]">
                          {product.category?.name || "Fireworks"}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Out of stock</span>
                        ) : product.stock < 5 ? (
                          <span className="text-[9px] font-black text-[#F5C451] uppercase tracking-wider">Low Stock ({product.stock})</span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-400">In Stock</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-black text-[#F5C451]">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        {product.discount && (
                          <span className="text-[8px] font-black text-[#FFF9EA] bg-[#6D3FD6] px-1 py-0.25 rounded-sm">
                            {product.discount} OFF
                          </span>
                        )}
                      </div>
                      {product.mrp && Number(product.mrp) > Number(product.price) && (
                        <span className="text-[10px] text-[#B9B8C7] line-through block">
                          ₹{Number(product.mrp).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}

              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="block text-center py-2.5 font-extrabold text-[#F5C451] hover:bg-[#11152E] transition-colors text-xs border-t border-[#292E4D]"
              >
                View all results for "{query}" →
              </Link>
            </div>
          )}

          {/* Empty State */}
          {!loading && hasSearched && results.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <span className="text-2xl block">🔍</span>
              <p className="font-bold text-[#FFF9EA]">No products found</p>
              <p className="text-[11px] text-[#B9B8C7]">Try searching for another product or category.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
