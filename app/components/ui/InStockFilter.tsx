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
        className="rounded text-[#6D3FD6] focus:ring-[#F5C451] border-[#292E4D] bg-[#11152E] w-4 h-4 cursor-pointer"
      />
      <span className="text-xs font-semibold text-[#B9B8C7]">In Stock Only</span>
    </label>
  );
}
