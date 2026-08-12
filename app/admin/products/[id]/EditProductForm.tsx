"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProductAction } from "@/lib/actions";

interface EditProductFormProps {
  product: {
    id: number;
    name: string;
    categoryId: number;
    price: number;
    mrp: number;
    quantity: string;
    unitType?: string;
    packSize?: string;
    stock: number;
    description: string | null;
    image: string | null;
    badge: string | null;
    featured: boolean;
    active: boolean;
  };
  categories: { id: number; name: string }[];
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [price, setPrice] = useState(product.price.toString());
  const [mrp, setMrp] = useState(product.mrp.toString());

  const priceNum = parseFloat(price) || 0;
  const mrpNum = parseFloat(mrp) || 0;
  const discountPercent = mrpNum > 0 && priceNum < mrpNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateProductAction(product.id, formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Product Name *</label>
            <input type="text" name="name" required defaultValue={product.name} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
            <select name="categoryId" required defaultValue={product.categoryId} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Type (e.g. BOX, PACK) *</label>
            <select name="unitType" required defaultValue={product.unitType || "BOX"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
              <option value="BOX">BOX</option>
              <option value="PACK">PACK</option>
              <option value="BUNDLE">BUNDLE</option>
              <option value="UNIT">UNIT</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Pieces per Unit / Pack Size *</label>
            <input type="text" name="packSize" required defaultValue={product.packSize || product.quantity || "10 Pieces"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Selling Price (₹) *</label>
            <input type="number" step="0.01" name="price" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">MRP (₹) *</label>
            <input type="number" step="0.01" name="mrp" required value={mrp} onChange={(e) => setMrp(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div className="sm:col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Calculated Discount:</span>
            <span className="text-red-700 font-black text-sm">{discountPercent}% OFF</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Stock Count *</label>
            <input type="number" name="stock" required defaultValue={product.stock} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Badge</label>
            <input type="text" name="badge" defaultValue={product.badge || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Image URL</label>
            <input type="url" name="image" defaultValue={product.image || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea name="description" rows={3} defaultValue={product.description || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
          </div>

          <div className="sm:col-span-2 flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" name="featured" value="true" defaultChecked={product.featured} className="rounded text-red-600 w-4 h-4" />
              <span>Featured Product</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input type="checkbox" name="active" value="true" defaultChecked={product.active} className="rounded text-red-600 w-4 h-4" />
              <span>Active on Storefront</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold rounded-xl shadow">
            {loading ? "Updating..." : "Update Product →"}
          </button>
        </div>
      </form>
    </div>
  );
}
