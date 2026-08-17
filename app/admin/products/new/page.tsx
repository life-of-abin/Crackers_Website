"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/lib/actions";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Calculated discount live preview
  const priceNum = parseFloat(price) || 0;
  const mrpNum = parseFloat(mrp) || 0;
  const discountPercent = mrpNum > 0 && priceNum < mrpNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createProductAction(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 selection:bg-[#6D3FD6] selection:text-white">
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-[#6D3FD6] uppercase tracking-widest block">
            Inventory Management
          </span>
          <h1 className="text-2xl font-black text-slate-900">Add New Cracker Product</h1>
        </div>
        <Link href="/admin/products" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl">
          ← Back to Products List
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. 10 cm Electric Sparklers B (10 Pcs)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit Type (e.g. BOX, PACK) *
              </label>
              <select
                name="unitType"
                required
                defaultValue="BOX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              >
                <option value="BOX">BOX</option>
                <option value="PACK">PACK</option>
                <option value="BUNDLE">BUNDLE</option>
                <option value="UNIT">UNIT</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pieces per Unit / Pack Size *
              </label>
              <input
                type="text"
                name="packSize"
                required
                defaultValue="10 Pieces"
                placeholder="e.g. 10 Pieces or 1 Pkt"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                placeholder="249.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                MRP (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                name="mrp"
                required
                placeholder="499.00"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            {/* Discount Preview */}
            <div className="sm:col-span-2 bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex items-center justify-between text-xs font-bold text-purple-900">
              <span>Automatically Calculated Discount:</span>
              <span className="text-[#6D3FD6] font-black text-sm">{discountPercent}% OFF</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Stock Count *
              </label>
              <input
                type="number"
                name="stock"
                required
                defaultValue="100"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Badge / Tag (Optional e.g. Bestseller)
              </label>
              <input
                type="text"
                name="badge"
                placeholder="Bestseller"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Image URL (Optional)
              </label>
              <input
                type="url"
                name="image"
                placeholder="/placeholder.png or https://..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Enter description, specifications or safety warnings..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6D3FD6]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" name="featured" value="true" className="rounded text-[#6D3FD6] w-4 h-4" />
                <span>Mark as Featured Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input type="checkbox" name="active" value="true" defaultChecked className="rounded text-[#6D3FD6] w-4 h-4" />
                <span>Product Active on Customer Storefront</span>
              </label>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link href="/admin/products" className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-200 cursor-pointer"
            >
              {loading ? "Creating..." : "Save & Add Product →"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
