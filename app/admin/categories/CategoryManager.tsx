"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions";

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sortOrder: number;
  active: boolean;
  productCount: number;
}

export default function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createCategoryAction(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setShowAddForm(false);
      setLoading(false);
      router.refresh();
    }
  };

  const handleUpdate = async (id: number, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateCategoryAction(id, formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setEditingId(null);
      setLoading(false);
      router.refresh();
    }
  };

  const handleDelete = async (id: number, name: string, productCount: number) => {
    const confirmMessage = productCount > 0
      ? `This category "${name}" contains ${productCount} products.\nDeleting the category will NOT delete these products.\n\nAre you sure you want to delete this category?`
      : `Are you sure you want to delete category "${name}"?`;

    if (window.confirm(confirmMessage)) {
      setLoading(true);
      const res = await deleteCategoryAction(id);
      setLoading(false);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-6 selection:bg-[#6D3FD6] selection:text-white">
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          {showAddForm ? (
            <span>✕ Cancel</span>
          ) : (
            <>
              <svg className="w-4 h-4 text-white shrink-0 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add Category</span>
            </>
          )}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-black text-sm text-slate-900 uppercase">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
              <input type="text" name="name" required placeholder="e.g. Ground Chakkras" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D3FD6] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sort Order *</label>
              <input type="number" name="sortOrder" defaultValue={categories.length + 1} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D3FD6] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Image Path / URL</label>
              <input type="text" name="image" placeholder="/categories/Rocket Icon.png" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D3FD6] outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <input type="text" name="description" placeholder="Short description..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6D3FD6] outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="px-5 py-2.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black text-xs rounded-xl shadow-md shadow-purple-200 cursor-pointer">
            Save Category
          </button>
        </form>
      )}

      {/* Category Cards / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {categories.map((c) => (
          <div key={c.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            {editingId === c.id ? (
              <form onSubmit={(e) => handleUpdate(c.id, e)} className="w-full space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Name</label>
                    <input type="text" name="name" defaultValue={c.name} required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Sort Order</label>
                    <input type="number" name="sortOrder" defaultValue={c.sortOrder} required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Image Path</label>
                    <input type="text" name="image" defaultValue={c.image || ""} placeholder="/categories/Rocket Icon.png" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-bold text-[10px] text-slate-500 mb-0.5">Description</label>
                    <input type="text" name="description" defaultValue={c.description || ""} placeholder="Description" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 font-bold">
                    <input type="checkbox" name="active" value="true" defaultChecked={c.active} />
                    <span>Active</span>
                  </label>
                  <button type="submit" disabled={loading} className="px-4 py-1.5 bg-emerald-600 text-white font-extrabold rounded-lg">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 p-1 relative overflow-hidden">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xl">{c.icon || "🎆"}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 text-[#6D3FD6] font-black text-[10px] px-2 py-0.5 rounded">Order: {c.sortOrder}</span>
                      <span className="font-black text-slate-900 text-sm">{c.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                        {c.active ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-medium block mt-0.5">{c.productCount} Products Linked • /{c.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingId(c.id)} className="px-3 py-1.5 bg-purple-50 text-[#6D3FD6] font-bold rounded-lg hover:bg-purple-100 cursor-pointer inline-flex items-center gap-1">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(c.id, c.name, c.productCount)} className="px-3 py-1.5 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 cursor-pointer inline-flex items-center gap-1">
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
