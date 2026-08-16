import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import SortSelect from "@/components/ui/SortSelect";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort = "featured" } = await searchParams;
  const settings = await getStoreSettings();
  const session = await getSession();

  let category: any = null;
  let products: any[] = [];

  let orderBy: any = { featured: "desc" };
  if (sort === "price-low") orderBy = { price: "asc" };
  if (sort === "price-high") orderBy = { price: "desc" };
  if (sort === "popular") orderBy = { purchases: "desc" };
  if (sort === "name") orderBy = { name: "asc" };

  try {
    category = await prisma.category.findUnique({
      where: { slug },
    });

    if (category && category.active) {
      products = await prisma.product.findMany({
        where: {
          categoryId: category.id,
          active: true,
        },
        include: { category: true },
        orderBy,
      });
    }
  } catch (err) {
    console.error("Failed to fetch category page data:", err);
  }

  if (!category || !category.active) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} user={session} />

      {/* Category Banner */}
      <div className="bg-white text-slate-900 py-10 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[#6D3FD6] text-xs font-bold uppercase tracking-wider mb-1">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:underline">Categories</Link>
            <span>/</span>
            <span>{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3 font-display">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-12 h-12 object-contain drop-shadow-xs" />
                ) : (
                  <span>{category.icon || "🎆"}</span>
                )}
                <span>{category.name} Collection</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                {category.description || `Browse our complete range of high-quality ${category.name} directly from Sivakasi factory.`}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
              <span className="text-slate-500">Total Items: </span>
              <strong className="text-[#6D3FD6] font-extrabold">{products.length} Products</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Sort Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{products.length}</strong> items in {category.name}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <SortSelect currentSort={sort} />
          </div>
        </div>

        {/* Product Cards Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <div className="text-5xl">📦</div>
            <h3 className="text-base font-bold text-slate-900 font-display">No products currently available</h3>
            <p className="text-xs text-slate-500">Check back soon for new arrivals in {category.name}.</p>
            <Link href="/products" className="inline-block bg-[#6D3FD6] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
      </main>

      <Footer settings={settings} />
    </div>
  );
}
