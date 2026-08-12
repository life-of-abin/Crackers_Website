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
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={inStockOnly}
        onChange={handleChange}
        className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
      />
      <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
    </label>
  );
}
