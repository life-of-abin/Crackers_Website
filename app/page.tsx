import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import HeroFireworks from "@/components/ui/HeroFireworks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getStoreSettings();
  const session = await getSession();

  // Fetch live categories with product counts
  const categories = await prisma.category.findMany({
    where: { active: true },
    include: {
      _count: {
        select: { products: { where: { active: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  // Fetch featured products
  const featuredProducts = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    take: 8,
    orderBy: { purchases: "desc" },
  });

  // Fetch best sellers
  const bestSellers = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    take: 8,
    orderBy: { purchases: "desc" },
  });

  // Fallback if no featured products marked
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : bestSellers.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header settings={settings} user={session} />

      {/* Hero Section */}
      <section className="relative bg-festive-hero text-white overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-amber-500/20">
        <HeroFireworks />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                <span>🪔 Official Sivakasi Wholesale Store</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-display">
                Celebrate Festive Joy With <span className="text-gold-gradient">Genuine Fireworks</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Direct factory wholesale pricing from Sivakasi, Tamil Nadu. Premium quality sparklers, rockets, gift boxes, and flower pots delivered safely to your doorstep.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl gold-glow hover:shadow-amber-500/30 text-sm sm:text-base transition-all transform hover:-translate-y-0.5 touch-target"
                >
                  Shop Whole Catalogue →
                </Link>
                <Link
                  href="/category/gift-items"
                  className="bg-slate-900/90 border border-slate-700 hover:bg-slate-800 text-amber-300 font-bold px-6 py-3.5 rounded-2xl text-sm transition-all touch-target"
                >
                  🎁 View Family Gift Boxes
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0 text-xs text-slate-300 font-semibold">
                <div>
                  <span className="block text-amber-400 font-black text-base font-display">100%</span>
                  Genuine Crackers
                </div>
                <div>
                  <span className="block text-amber-400 font-black text-base font-display">50% OFF</span>
                  Factory Discounts
                </div>
                <div>
                  <span className="block text-amber-400 font-black text-base font-display">Safe</span>
                  Express Transit
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative">
              <div className="relative mx-auto max-w-md glass-card-dark p-6 rounded-3xl shadow-2xl gold-glow-lg border border-amber-500/30">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h3 className="font-black text-white text-sm font-display">Festive Special Offer</h3>
                      <p className="text-[10px] text-amber-400 font-semibold">Limited Stock Available</p>
                    </div>
                  </div>
                  <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">
                    50% OFF
                  </span>
                </div>

                <div className="py-6 text-center space-y-3">
                  <div className="text-6xl animate-bounce">🎁</div>
                  <h4 className="text-lg font-black text-amber-200 font-display">Deluxe Family Festive Combo Pack</h4>
                  <p className="text-xs text-slate-300">Contains 35 Assorted High-Quality Fireworks & Sparklers</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black text-white font-display">₹1,499</span>
                    <span className="text-sm text-slate-400 line-through">₹2,999</span>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="block w-full text-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black py-3.5 rounded-xl hover:from-amber-300 hover:to-amber-500 transition-colors text-xs uppercase tracking-wider shadow-md"
                >
                  Explore All Offers Now
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Shop By Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Browse our complete Sivakasi cracker collection
              </p>
            </div>
            <Link href="/products" className="text-xs font-bold text-red-700 hover:text-red-800">
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 rounded-2xl p-4 text-center transition-all festive-card-hover"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon || "🎆"}
                </div>
                <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  {cat._count.products} Products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Best Sellers Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">
                Top Rated Fireworks
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Best Selling Fireworks
              </h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-red-700 hover:text-red-800">
              Explore Store →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayFeatured.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  mrp: Number(product.mrp),
                  discount: product.discount,
                  quantity: product.quantity,
                  image: product.image,
                  badge: product.badge,
                  stock: product.stock,
                  category: product.category,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Sivakasi Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Why Choose <span className="text-gold-gradient">{settings.storeName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              We take pride in delivering genuine fireworks and exceptional service direct from Sivakasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Authentic Sivakasi Crackers */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl text-amber-400 shadow-sm group-hover:scale-110 transition-transform">
                🏭
              </div>
              <h3 className="font-extrabold text-base text-white">Authentic Sivakasi Crackers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Genuine fireworks sourced from Sivakasi manufacturers.
              </p>
            </div>

            {/* Card 2: Quality You Can Trust */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-3xl text-red-400 shadow-sm group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-white">Quality You Can Trust</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Carefully selected products with a focus on quality and reliability.
              </p>
            </div>

            {/* Card 3: Best Value Prices */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl text-amber-300 shadow-sm group-hover:scale-110 transition-transform">
                🏷️
              </div>
              <h3 className="font-extrabold text-base text-white">Best Value Prices</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Competitive prices with seasonal offers and attractive savings.
              </p>
            </div>

            {/* Card 4: Safe & Reliable Service */}
            <div className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                🚚
              </div>
              <h3 className="font-extrabold text-base text-white">Safe & Reliable Service</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure ordering, careful packing, and dependable customer support.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Store Information / Contact Section */}
      <section className="py-16 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-t border-amber-500/20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
            <span>📍 STORE INFORMATION & CONTACT</span>
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Connect With Sivakasi Crackers
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Our store support team is here to assist you with inquiries, custom orders, and quick tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {/* Phone Card */}
            <a
              href="tel:9629525907"
              className="bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 p-6 rounded-2xl hover:bg-slate-800/90 transition-all group shadow-lg text-center flex flex-col items-center justify-between space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform shadow-md">
                📞
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Phone Support
                </span>
                <span className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors font-mono">
                  9629525907
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-400/80">Tap to Call →</span>
            </a>

            {/* WhatsApp Card */}
            <a
              href="https://wa.me/919629525907"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500/60 p-6 rounded-2xl hover:bg-slate-800/90 transition-all group shadow-lg text-center flex flex-col items-center justify-between space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform shadow-md">
                💬
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                  WhatsApp Support
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-400 group-hover:text-emerald-300 transition-colors font-mono">
                  9629525907
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400/80">Chat on WhatsApp →</span>
            </a>

            {/* Email Card */}
            <a
              href="mailto:abinesh.ece2003@gmail.com"
              className="bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 p-6 rounded-2xl hover:bg-slate-800/90 transition-all group shadow-lg text-center flex flex-col items-center justify-between space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform shadow-md">
                ✉️
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Email Support
                </span>
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors break-all">
                  abinesh.ece2003@gmail.com
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-400/80">Send Email →</span>
            </a>

            {/* Shop Location Card */}
            <a
              href="https://maps.google.com/?q=Sivakasi,Tamil+Nadu"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/60 p-6 rounded-2xl hover:bg-slate-800/90 transition-all group shadow-lg text-center flex flex-col items-center justify-between space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform shadow-md">
                📍
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block">
                  Shop Location
                </span>
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  Sivakasi, Tamil Nadu, India
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-400/80">Open Location Map →</span>
            </a>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </div>
  );
}