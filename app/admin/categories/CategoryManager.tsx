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
    if (productCount > 0) {
      alert(`Cannot delete category "${name}" because it contains ${productCount} products. Please reassign or delete products first.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      const res = await deleteCategoryAction(id);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow"
        >
          {showAddForm ? "✕ Cancel" : "➕ Add Category"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-black text-sm text-slate-900 uppercase">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
              <input type="text" name="name" required placeholder="e.g. Ground Spinners" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Emoji / Icon</label>
              <input type="text" name="icon" placeholder="🎆" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <input type="text" name="description" placeholder="Short description..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" name="name" defaultValue={c.name} required className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" />
                  <input type="text" name="icon" defaultValue={c.icon || ""} placeholder="Emoji Icon" className="p-2 bg-slate-50 border border-slate-200 rounded-lg" />
                  <input type="text" name="description" defaultValue={c.description || ""} placeholder="Description" className="p-2 bg-slate-50 border border-slate-200 rounded-lg" />
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
                  <span className="text-2xl bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100">{c.icon || "🎆"}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{c.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                        {c.active ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-medium">{c.productCount} Products Linked • /{c.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingId(c.id)} className="px-3 py-1.5 bg-amber-50 text-amber-900 font-bold rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id, c.name, c.productCount)} className="px-3 py-1.5 bg-red-50 text-red-700 font-bold rounded-lg">
                    Delete
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
