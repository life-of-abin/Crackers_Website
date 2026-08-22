"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProductAction, toggleProductActiveAction, updateStockAction } from "@/lib/actions";

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  discount: string | null;
  quantity: string;
  stock: number;
  active: boolean;
  featured: boolean;
  badge: string | null;
  categoryName: string;
  categoryId: number;
}

interface TableProps {
  initialProducts: ProductRow[];
  categories: { id: number; name: string }[];
  initialSearch: string;
  initialCategoryId: string;
  initialStockStatus?: string;
}

function InlineStockInput({
  productId,
  initialStock,
  onSave,
}: {
  productId: number;
  initialStock: number;
  onSave: (id: number, newStock: number) => Promise<void>;
}) {
  const safeInitial = Math.min(99999, Math.max(0, initialStock));
  const [stockVal, setStockVal] = useState<string>(safeInitial.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [showExcessWarning, setShowExcessWarning] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const safe = Math.min(99999, Math.max(0, initialStock));
    setStockVal(safe.toString());
  }, [initialStock]);

  const saveStock = async (val: number) => {
    const safeNum = Math.min(99999, Math.max(0, val));
    setStockVal(safeNum.toString());
    setIsSaving(true);
    try {
      await onSave(productId, safeNum);
    } catch (err) {
      console.error("Failed to update stock:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = () => {
    setShowExcessWarning(false);
    let num = parseInt(stockVal, 10);
    if (isNaN(num) || num < 0) {
      num = 0;
    }
    if (num > 99999) {
      num = 99999;
    }
    setStockVal(num.toString());
    if (num !== safeInitial) {
      saveStock(num);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={5}
        value={stockVal}
        onKeyDown={(e) => {
          if (["e", "E", "+", "-", "."].includes(e.key)) {
            e.preventDefault();
          }
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          }
        }}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          if (raw.length > 5) {
            setShowExcessWarning(true);
            setTimeout(() => setShowExcessWarning(false), 2500);
          } else {
            setShowExcessWarning(false);
          }
          const cleaned = raw.slice(0, 5);
          setStockVal(cleaned);
        }}
        onBlur={handleBlur}
        className={`w-20 px-2 py-1.5 border rounded-xl text-center font-black text-xs focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] transition-all ${
          (parseInt(stockVal, 10) || 0) === 0
            ? "bg-red-50 border-red-300 text-red-600 font-black"
            : "bg-white border-slate-300 text-slate-900"
        }`}
        title="Enter stock count (max 5 digits: 0 to 99999). Press Enter or click outside to save."
      />
      {showExcessWarning && (
        <span className="absolute -bottom-5 text-[9px] font-black text-red-600 bg-red-50 border border-red-200 px-1 py-0.5 rounded whitespace-nowrap shadow-sm z-20">
          Max 5 digits!
        </span>
      )}
      {isSaving && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6D3FD6] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#6D3FD6]"></span>
        </span>
      )}
    </div>
  );
}

export default function AdminProductTable({
  initialProducts,
  categories,
  initialSearch,
  initialCategoryId,
  initialStockStatus = "",
}: TableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [selectedCat, setSelectedCat] = useState(initialCategoryId);
  const [stockStatus, setStockStatus] = useState(initialStockStatus);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const applyFilters = (newStockStatus?: string, newCat?: string) => {
    const targetStock = newStockStatus !== undefined ? newStockStatus : stockStatus;
    const targetCat = newCat !== undefined ? newCat : selectedCat;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (targetCat) params.set("categoryId", targetCat);
    if (targetStock) params.set("stockStatus", targetStock);
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    setLoadingId(id);
    await toggleProductActiveAction(id, !currentActive);
    setLoadingId(null);
    router.refresh();
  };

  const handleStockUpdate = async (id: number, newStock: number) => {
    const safeStock = Math.max(0, newStock);
    setLoadingId(id);
    await updateStockAction(id, safeStock);
    setLoadingId(null);
    router.refresh();
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      setLoadingId(id);
      const res = await deleteProductAction(id);
      setLoadingId(null);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    }
  };

  const stockTabs = [
    { label: "All Products", value: "", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "🟢 In Stock", value: "in_stock", color: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
    { label: "🟡 Low Stock", value: "low_stock", color: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
    { label: "🔴 Out of Stock", value: "out_of_stock", color: "bg-red-100 text-red-800 hover:bg-red-200" },
    { label: "⚪ Inactive", value: "inactive", color: "bg-slate-200 text-slate-700 hover:bg-slate-300" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      
      {/* Stock Status Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2">
          Filter by Status:
        </span>
        {stockTabs.map((tab) => {
          const isActive = stockStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStockStatus(tab.value);
                applyFilters(tab.value);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#6D3FD6] text-white shadow-sm shadow-purple-200 scale-105"
                  : tab.color
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        {stockStatus && (
          <button
            onClick={() => {
              setStockStatus("");
              applyFilters("");
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 underline ml-2 cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
          />

          <select
            value={selectedCat}
            onChange={(e) => {
              setSelectedCat(e.target.value);
              applyFilters(undefined, e.target.value);
            }}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6D3FD6] cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => applyFilters()}
            className="px-5 py-2.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Filter
          </button>
        </div>

      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase">
              <th className="pb-3">Product Name</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Price / MRP</th>
              <th className="pb-3">Discount</th>
              <th className="pb-3 text-center">Stock Count</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {initialProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No products found matching filters.
                </td>
              </tr>
            ) : (
              initialProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  
                  <td className="py-3 max-w-[200px]">
                    <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-400 block">Pkg: {p.quantity}</span>
                  </td>

                  <td className="py-3">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[10px]">
                      {p.categoryName}
                    </span>
                  </td>

                  <td className="py-3">
                    <span className="font-extrabold text-slate-900 block">₹{p.price.toLocaleString("en-IN")}</span>
                    <span className="line-through text-slate-400 text-[10px]">₹{p.mrp.toLocaleString("en-IN")}</span>
                  </td>

                  <td className="py-3">
                    {p.discount ? (
                      <span className="bg-purple-50 text-[#6D3FD6] font-black text-[10px] px-2 py-0.5 rounded">
                        {p.discount}
                      </span>
                    ) : "-"}
                  </td>

                  <td className="py-3 text-center">
                    <InlineStockInput
                      productId={p.id}
                      initialStock={p.stock}
                      onSave={handleStockUpdate}
                    />
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => handleToggleActive(p.id, p.active)}
                      disabled={loadingId === p.id}
                      className={`px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer ${
                        p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {p.active ? "Active" : "Disabled"}
                    </button>
                  </td>

                  <td className="py-3 text-right space-x-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-extrabold text-[#6D3FD6] hover:text-[#5B21B6] bg-purple-50 px-2.5 py-1 rounded text-[11px] inline-flex items-center gap-1"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={loadingId === p.id}
                      className="font-extrabold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded text-[11px] cursor-pointer inline-flex items-center gap-1"
                    >
                      🗑️ Delete
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

