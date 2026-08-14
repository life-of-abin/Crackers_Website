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
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} user={session} />

      {/* Page Header Banner */}
      <div className="bg-[#11152E] text-[#FFF9EA] py-10 border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#F5C451] text-xs font-semibold uppercase tracking-wider mb-1">
                <Link href="/" className="hover:underline">Home</Link>
                <span>/</span>
                <span>Products Catalogue</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#FFF9EA] font-display">
                Complete Fireworks Catalogue
              </h1>
              <p className="text-xs sm:text-sm text-[#B9B8C7] mt-1">
                Showing {products.length} genuine Sivakasi crackers available for wholesale order
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#151A35] border border-[#292E4D] px-4 py-2.5 rounded-xl flex items-center gap-4 text-xs">
              <div>
                <span className="block text-[#F5C451] font-extrabold">{categories.length}</span>
                <span className="text-[#B9B8C7]">Categories</span>
              </div>
              <div className="h-6 w-px bg-[#292E4D]" />
              <div>
                <span className="block text-[#4ADE80] font-extrabold">Min. 2 Items</span>
                <span className="text-[#B9B8C7]">Order Requirement</span>
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
            <div className="bg-[#151A35] p-5 rounded-2xl border border-[#292E4D] shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#292E4D] pb-3">
                <h3 className="font-extrabold text-sm text-[#FFF9EA] uppercase tracking-wider font-display">
                  Filters
                </h3>
                <Link
                  href="/products"
                  className="text-[11px] font-bold text-[#F5C451] hover:underline"
                >
                  Reset All
                </Link>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-[#B9B8C7] uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  <Link
                    href="/products"
                    className={`block px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCategory === ""
                        ? "bg-[#6D3FD6]/30 text-[#F5C451] font-bold border border-[#6D3FD6]/40"
                        : "text-[#B9B8C7] hover:bg-[#11152E] hover:text-[#FFF9EA]"
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
                          ? "bg-[#6D3FD6]/30 text-[#F5C451] font-bold border border-[#6D3FD6]/40"
                          : "text-[#B9B8C7] hover:bg-[#11152E] hover:text-[#FFF9EA]"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* In Stock Filter */}
              <div className="pt-3 border-t border-[#292E4D]">
                <InStockFilter inStockOnly={inStockOnly} />
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 space-y-6">
            
            {/* Top Controls & Sort Bar */}
            <div className="bg-[#151A35] p-4 rounded-2xl border border-[#292E4D] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-[#B9B8C7]">
                Showing <strong className="text-[#FFF9EA]">{products.length}</strong> products
              </span>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[#B9B8C7] font-medium">Sort by:</span>
                <SortSelect currentSort={sortOption} />
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="bg-[#151A35] rounded-2xl border border-[#292E4D] p-12 text-center space-y-4 shadow-xl">
                <div className="text-5xl">🔍</div>
                <h3 className="text-lg font-bold text-[#FFF9EA] font-display">No products found</h3>
                <p className="text-xs text-[#B9B8C7] max-w-sm mx-auto">
                  We couldn't find any products matching your current filters. Try resetting the category or search criteria.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-[#F5C451] text-[#080B1A] font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#FFE29A] transition-colors shadow-lg"
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
