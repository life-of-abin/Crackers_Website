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
      className="bg-[#11152E] border border-[#292E4D] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#FFF9EA] focus:outline-none focus:ring-2 focus:ring-[#F5C451] cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#11152E] text-[#FFF9EA]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
