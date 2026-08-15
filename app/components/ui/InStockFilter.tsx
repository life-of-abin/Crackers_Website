"use client";

import React from "react";

interface InStockFilterProps {
  inStockOnly: boolean;
}

export default function InStockFilter({ inStockOnly }: InStockFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = new URL(window.location.href);
    if (e.target.checked) {
      url.searchParams.set("inStock", "true");
    } else {
      url.searchParams.delete("inStock");
    }
    window.location.href = url.pathname + url.search;
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={inStockOnly}
        onChange={handleChange}
        className="rounded text-[#6D3FD6] focus:ring-[#6D3FD6] border-slate-300 bg-slate-50 w-4 h-4 cursor-pointer"
      />
      <span className="text-xs font-bold text-slate-700">In Stock Only</span>
    </label>
  );
}
