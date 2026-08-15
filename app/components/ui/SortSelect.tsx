"use client";

import React from "react";

export interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  currentSort: string;
  options?: SortOption[];
  paramName?: string;
}

const defaultOptions: SortOption[] = [
  { value: "featured", label: "Featured / Bestsellers" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "name", label: "Name: A to Z" },
];

export default function SortSelect({
  currentSort,
  options = defaultOptions,
  paramName = "sort",
}: SortSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    url.searchParams.set(paramName, e.target.value);
    window.location.href = url.pathname + url.search;
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
