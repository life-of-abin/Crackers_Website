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

export default function LiveSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search sparklers, rockets, gift boxes, flower pots..."
            value={query}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all shadow-inner"
          />

          {/* Clear button ✕ */}
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-11 text-slate-400 hover:text-slate-700 text-xs font-extrabold px-1 py-0.5 rounded-full"
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Search Glass Button */}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center text-xs"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      </form>

      {/* Floating Live Search Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs max-h-96 overflow-y-auto">
          
          {/* Loading Indicator */}
          {loading && (
            <div className="p-4 text-center text-slate-500 font-medium flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span>Searching products...</span>
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2 bg-slate-50 font-bold text-[10px] text-slate-400 uppercase tracking-wider flex justify-between items-center">
                <span>Matching Products</span>
                <span className="text-amber-600 font-extrabold">{results.length} found</span>
              </div>

              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-amber-50/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden font-bold text-slate-400 text-xs">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      "🎆"
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 group-hover:text-red-700 transition-colors block truncate">
                      {product.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {product.category?.name || "Fireworks"}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-black text-red-700 block">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                    {product.mrp && Number(product.mrp) > Number(product.price) && (
                      <span className="text-[10px] text-slate-400 line-through block">
                        ₹{Number(product.mrp).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="block text-center py-2.5 font-extrabold text-red-600 hover:bg-red-50 transition-colors text-xs border-t border-slate-100"
              >
                View all results for "{query}" →
              </Link>
            </div>
          )}

          {/* Empty State */}
          {!loading && hasSearched && results.length === 0 && (
            <div className="p-6 text-center space-y-2">
              <span className="text-2xl block">🔍</span>
              <p className="font-bold text-slate-800">No products found for "{query}"</p>
              <p className="text-[11px] text-slate-500">Try checking spelling or search for categories like "sparklers", "rockets", "chakkars".</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
