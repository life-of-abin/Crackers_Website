import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import HeroFireworks from "@/components/ui/HeroFireworks";
import BestSellersCarousel from "@/components/ui/BestSellersCarousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  // Fetch live categories with product counts
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { products: { where: { active: true } } },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }

  // Fetch featured products
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: true },
      take: 8,
      orderBy: { purchases: "desc" },
    });
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
  }

  // Fetch top 10 best sellers
  let bestSellers: any[] = [];
  try {
    bestSellers = await prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      take: 10,
      orderBy: { purchases: "desc" },
    });
  } catch (err) {
    console.error("Failed to fetch best sellers:", err);
  }

  const displayBestSellers = bestSellers.length > 0 ? bestSellers : featuredProducts;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} user={session} />

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-purple-50 via-white to-[#F8FAFC] text-slate-900 overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-slate-200">
        <HeroFireworks />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6D3FD6_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 text-[#6D3FD6] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xs">
                <span>🪔 Official Sivakasi Wholesale Store</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-display text-slate-900">
                Light Up Your <span className="text-[#6D3FD6]">Diwali</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Premium Sivakasi Crackers Delivered to Your Door. Direct factory wholesale pricing from Sivakasi, Tamil Nadu with safe express delivery across India.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-[#6D3FD6] hover:bg-[#5B21B6] text-white font-black px-8 py-3.5 rounded-2xl shadow-md text-sm sm:text-base transition-all transform hover:-translate-y-0.5 touch-target"
                >
                  Shop Crackers →
                </Link>
                <Link
                  href="/products#categories"
                  className="bg-white border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-[#6D3FD6] font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-xs touch-target"
                >
                  Explore Categories
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 max-w-md mx-auto lg:mx-0 text-xs text-slate-500 font-semibold">
                <div>
                  <span className="block text-[#6D3FD6] font-black text-base font-display">100%</span>
                  Genuine Crackers
                </div>
                <div>
                  <span className="block text-[#6D3FD6] font-black text-base font-display">50% OFF</span>
                  Wholesale Savings
                </div>
                <div>
                  <span className="block text-emerald-600 font-black text-base font-display">Safe</span>
                  Express Transit
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative">
              <div className="relative mx-auto max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-purple-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm font-display">Festive Special Offer</h3>
                      <p className="text-[10px] text-[#6D3FD6] font-bold">Limited Stock Available</p>
                    </div>
                  </div>
                  <span className="bg-[#6D3FD6] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-xs">
                    50% OFF
                  </span>
                </div>

                <div className="py-6 text-center space-y-3">
                  <div className="text-6xl animate-bounce">🎁</div>
                  <h4 className="text-lg font-black text-slate-900 font-display">Deluxe Family Festive Combo Pack</h4>
                  <p className="text-xs text-slate-500">Contains 35 Assorted High-Quality Fireworks & Sparklers</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black text-[#6D3FD6] font-display">₹1,499</span>
                    <span className="text-sm text-slate-400 line-through">₹2,999</span>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="block w-full text-center bg-[#6D3FD6] text-white font-black py-3.5 rounded-xl hover:bg-[#5B21B6] transition-colors text-xs uppercase tracking-wider shadow-sm"
                >
                  Explore All Offers Now
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BEST SELLERS CAROUSEL SECTION */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-display">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Most loved by our customers this season
            </p>
          </div>

          <BestSellersCarousel products={displayBestSellers.map(p => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price),
            mrp: Number(p.mrp),
            discount: p.discount,
            quantity: p.quantity,
            image: p.image,
            badge: p.badge,
            stock: p.stock,
            category: p.category,
          })) as any} />
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section id="categories" className="py-12 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-display shrink-0">
                Shop By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Browse our complete Sivakasi cracker collection
              </p>
            </div>
            <Link href="/products" className="text-xs font-extrabold text-[#6D3FD6] hover:underline">
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col items-center justify-between min-h-[140px]"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain drop-shadow-xs" />
                  ) : (
                    <span>{cat.icon || "🎆"}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 group-hover:text-[#6D3FD6] transition-colors line-clamp-1 font-display">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">
                    {cat._count.products} Products
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FESTIVAL OFFER BANNER / DIWALI COMBO */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#5B21B6] via-[#6D3FD6] to-[#7C3AED] p-8 sm:p-12 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl text-white">
            <div className="space-y-2 max-w-xl">
              <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Exclusive Festival Offer
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                Diwali Family Combo
              </h3>
              <p className="text-xs sm:text-sm text-purple-100">
                Everything you need for a spectacular celebration. Contact us for custom wholesale package pricing.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/products"
                className="inline-block bg-white text-[#6D3FD6] hover:bg-amber-300 hover:text-slate-900 font-black px-8 py-4 rounded-2xl shadow-md text-sm transition-all transform hover:scale-105"
              >
                Shop Combo Packs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SIVAKASI */}
      <section className="py-16 bg-[#F8FAFC] text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-display">
              Why Choose <span className="text-[#6D3FD6]">{settings.storeName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We take pride in delivering genuine fireworks and exceptional service direct from Sivakasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Authentic Sivakasi Crackers */}
            <div className="bg-white border border-slate-200 hover:border-purple-300 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl text-[#6D3FD6] shadow-xs group-hover:scale-110 transition-transform">
                🏭
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Authentic Sivakasi Crackers</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Genuine fireworks sourced directly from Sivakasi factories.
              </p>
            </div>

            {/* Card 2: Quality You Can Trust */}
            <div className="bg-white border border-slate-200 hover:border-purple-300 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl text-[#6D3FD6] shadow-xs group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Quality You Can Trust</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Carefully selected products with strict quality and safety checks.
              </p>
            </div>

            {/* Card 3: Best Festival Prices */}
            <div className="bg-white border border-slate-200 hover:border-purple-300 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl text-[#6D3FD6] shadow-xs group-hover:scale-110 transition-transform">
                🏷️
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Best Festival Prices</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Factory wholesale pricing with massive festive savings.
              </p>
            </div>

            {/* Card 4: Safe & Reliable Service */}
            <div className="bg-white border border-slate-200 hover:border-purple-300 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-3xl text-[#6D3FD6] shadow-xs group-hover:scale-110 transition-transform">
                🚚
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Safe & Reliable Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure ordering, protective packaging, and dedicated support.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </div>
  );
}