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

  let products: any[] = [];
  let categories: any[] = [];

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: { category: true },
        orderBy,
      }),
      prisma.category.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);
    products = fetchedProducts;
    categories = fetchedCategories;
  } catch (err) {
    console.error("Failed to fetch products page data:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} user={session} />

      {/* Page Header Banner */}
      <div className="bg-white text-slate-900 py-10 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#6D3FD6] text-xs font-bold uppercase tracking-wider mb-1">
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <span>Products Catalogue</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
                Complete Fireworks Catalogue
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing {products.length} genuine Sivakasi crackers available for wholesale order
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-4 text-xs">
              <div>
                <span className="block text-[#6D3FD6] font-extrabold">{categories.length}</span>
                <span className="text-slate-500">Categories</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="block text-[#6D3FD6] font-extrabold">{products.length}</span>
                <span className="text-slate-500">Products</span>
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
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider font-display">
                  Filters
                </h3>
                <Link
                  href="/products"
                  className="text-[11px] font-bold text-[#6D3FD6] hover:underline"
                >
                  Reset All
                </Link>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  <Link
                    href="/products"
                    className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                      selectedCategory === ""
                        ? "bg-purple-50 text-[#6D3FD6] border border-purple-200"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}&sort=${sortOption}`}
                      className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-purple-50 text-[#6D3FD6] border border-purple-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* In Stock Filter */}
              <div className="pt-3 border-t border-slate-200">
                <InStockFilter inStockOnly={inStockOnly} />
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 space-y-6">
            
            {/* Top Controls & Sort Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-slate-500">
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
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <div className="text-5xl">🔍</div>
                <h3 className="text-lg font-bold text-slate-900 font-display">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any products matching your current filters. Try resetting the category or search criteria.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-[#6D3FD6] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#5B21B6] transition-colors shadow-xs"
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
