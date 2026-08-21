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
            className="w-full pl-3.5 pr-20 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-xs"
          />

          {/* Clear button ✕ */}
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-11 text-slate-400 hover:text-slate-700 text-xs font-extrabold px-1 py-0.5 cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold rounded-lg transition-colors flex items-center justify-center text-xs shadow-xs cursor-pointer"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      </form>

      {/* Floating Live Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs max-h-96 overflow-y-auto">
          
          {/* Loading Indicator */}
          {loading && (
            <div className="p-4 text-center text-slate-500 font-medium flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Searching fireworks...</span>
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2 bg-slate-50 font-bold text-[10px] text-slate-500 uppercase tracking-wider flex justify-between items-center border-b border-slate-100">
                <span>Matching Fireworks</span>
                <span className="text-[#6D3FD6] font-extrabold">{results.length} found</span>
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
                      isFocused ? "bg-purple-50 border-l-2 border-[#6D3FD6]" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden font-bold text-slate-400 text-xs">
                      <img src={product.image || "/placeholder.png"} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 group-hover:text-[#6D3FD6] transition-colors block truncate">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500">
                          {product.category?.name || "Fireworks"}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-black text-red-600 uppercase tracking-wider">Out of stock</span>
                        ) : product.stock < 5 ? (
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider">Low Stock ({product.stock})</span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-600">In Stock</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-black text-[#6D3FD6]">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        {product.discount && (
                          <span className="text-[8px] font-black text-amber-950 bg-[#F5C451] px-1 py-0.25 rounded-sm">
                            {product.discount} OFF
                          </span>
                        )}
                      </div>
                      {product.mrp && Number(product.mrp) > Number(product.price) && (
                        <span className="text-[10px] text-slate-400 line-through block">
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
                className="block text-center py-2.5 font-extrabold text-[#6D3FD6] hover:bg-purple-50 transition-colors text-xs border-t border-slate-100"
              >
                View all results for "{query}" →
              </Link>
            </div>
          )}

          {/* Empty State */}
          {!loading && hasSearched && results.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <span className="text-2xl block">🔍</span>
              <p className="font-bold text-slate-800">No products found</p>
              <p className="text-[11px] text-slate-500">Try searching for another product or category.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
