"use client";

import React, { useState } from "react";
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
}

export default function AdminProductTable({ initialProducts, categories, initialSearch, initialCategoryId }: TableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [selectedCat, setSelectedCat] = useState(initialCategoryId);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedCat) params.set("categoryId", selectedCat);
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    setLoadingId(id);
    await toggleProductActiveAction(id, !currentActive);
    setLoadingId(null);
    router.refresh();
  };

  const handleStockUpdate = async (id: number, newStock: number) => {
    setLoadingId(id);
    await updateStockAction(id, newStock);
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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
      
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
          />

          <select
            value={selectedCat}
            onChange={(e) => {
              setSelectedCat(e.target.value);
              const params = new URLSearchParams();
              if (search) params.set("q", search);
              if (e.target.value) params.set("categoryId", e.target.value);
              router.push(`/admin/products?${params.toString()}`);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
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
              <th className="pb-3">Stock Count</th>
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
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      {p.categoryName}
                    </span>
                  </td>

                  <td className="py-3">
                    <span className="font-extrabold text-red-700 block">₹{p.price.toLocaleString("en-IN")}</span>
                    <span className="line-through text-slate-400 text-[10px]">₹{p.mrp.toLocaleString("en-IN")}</span>
                  </td>

                  <td className="py-3">
                    {p.discount ? (
                      <span className="bg-red-50 text-red-700 font-black text-[10px] px-2 py-0.5 rounded">
                        {p.discount}
                      </span>
                    ) : "-"}
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStockUpdate(p.id, Math.max(0, p.stock - 10))}
                        className="w-5 h-5 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300"
                        title="-10 Stock"
                      >
                        -
                      </button>
                      <span className={`font-black px-2 ${p.stock === 0 ? "text-red-600" : "text-slate-900"}`}>
                        {p.stock}
                      </span>
                      <button
                        onClick={() => handleStockUpdate(p.id, p.stock + 10)}
                        className="w-5 h-5 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300"
                        title="+10 Stock"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => handleToggleActive(p.id, p.active)}
                      disabled={loadingId === p.id}
                      className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                        p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {p.active ? "Active" : "Disabled"}
                    </button>
                  </td>

                  <td className="py-3 text-right space-x-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-extrabold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded text-[11px]"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={loadingId === p.id}
                      className="font-extrabold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded text-[11px]"
                    >
                      Delete
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
