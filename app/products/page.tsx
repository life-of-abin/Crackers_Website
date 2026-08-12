import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import SortSelect from "@/components/ui/SortSelect";
import InStockFilter from "@/components/ui/InStockFilter";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const settings = await getStoreSettings();
  const session = await getSession();

  const selectedCategory = params.category || "";
  const searchQuery = params.search || "";
  const sortOption = params.sort || "featured";
  const inStockOnly = params.inStock === "true";

  // Build Prisma query filters dynamically
  const whereClause: any = {
    active: true,
  };

  if (selectedCategory) {
    whereClause.category = {
      slug: selectedCategory,
    };
  }

  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ];
  }

  if (inStockOnly) {
    whereClause.stock = { gt: 0 };
  }

  // Sorting
  let orderBy: any = { featured: "desc" };
  if (sortOption === "price-low") orderBy = { price: "asc" };
  if (sortOption === "price-high") orderBy = { price: "desc" };
  if (sortOption === "name") orderBy = { name: "asc" };
  if (sortOption === "popular") orderBy = { purchases: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy,
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} user={session} />

      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white py-10 border-b border-amber-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <span>Products Catalogue</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Complete Fireworks Catalogue
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Showing {products.length} genuine Sivakasi crackers available for wholesale order
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900/80 border border-amber-500/20 px-4 py-2.5 rounded-xl flex items-center gap-4 text-xs">
              <div>
                <span className="block text-amber-400 font-extrabold">{categories.length}</span>
                <span className="text-slate-400">Categories</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="block text-emerald-400 font-extrabold">Min. ₹{settings.minOrderAmount}</span>
                <span className="text-slate-400">Order Threshold</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Filters
                </h3>
                <Link
                  href="/products"
                  className="text-[11px] font-bold text-red-600 hover:underline"
                >
                  Reset All
                </Link>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  <Link
                    href="/products"
                    className={`block px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCategory === ""
                        ? "bg-red-50 text-red-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}&sort=${sortOption}`}
                      className={`block px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-red-50 text-red-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* In Stock Filter */}
              <div className="pt-3 border-t border-slate-100">
                <InStockFilter inStockOnly={inStockOnly} />
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 space-y-6">
            
            {/* Top Controls & Sort Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-slate-600">
                Showing <strong className="text-slate-900">{products.length}</strong> products
              </span>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <SortSelect currentSort={sortOption} />
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="text-5xl">🔍</div>
                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching your current filters. Try resetting the category or search criteria.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-red-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
                >
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={{
                      id: prod.id,
                      slug: prod.slug,
                      name: prod.name,
                      price: Number(prod.price),
                      mrp: Number(prod.mrp),
                      discount: prod.discount,
                      quantity: prod.quantity,
                      image: prod.image,
                      badge: prod.badge,
                      stock: prod.stock,
                      category: prod.category,
                    }}
                  />
                ))}
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
