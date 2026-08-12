import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import SortSelect from "@/components/ui/SortSelect";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", sort = "featured" } = await searchParams;
  const settings = await getStoreSettings();
  const session = await getSession();

  const queryClean = q.trim();

  let orderBy: any = { featured: "desc" };
  if (sort === "price-low") orderBy = { price: "asc" };
  if (sort === "price-high") orderBy = { price: "desc" };
  if (sort === "popular") orderBy = { purchases: "desc" };

  const products = queryClean
    ? await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: queryClean } },
          { description: { contains: queryClean } },
          { category: { name: { contains: queryClean } } },
        ],
      },
      include: { category: true },
      orderBy,
    })
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} user={session} />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Search Results</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            Search Results for <span className="text-amber-400">"{queryClean}"</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Found {products.length} products matching your query
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {products.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              Showing <strong className="text-slate-900">{products.length}</strong> search results
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort:</span>
              <SortSelect currentSort={sort} />
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="text-5xl">🔍</div>
            <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find any crackers matching "{queryClean}". Try searching for terms like "sparklers", "rockets", "gift box", or "flower pots".
            </p>
            <Link
              href="/products"
              className="inline-block bg-red-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
            >
              Browse All Fireworks
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
