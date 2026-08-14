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

  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : bestSellers.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} user={session} />

      {/* HERO SECTION: Midnight Diwali Night Sky Theme */}
      <section className="relative bg-festive-hero text-[#FFF9EA] overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-[#292E4D]">
        <HeroFireworks />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F5C451_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-[#6D3FD6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#11152E] border border-[#F5C451]/40 text-[#F5C451] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                <span>🪔 Official Sivakasi Wholesale Store</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-display text-[#FFF9EA]">
                Light Up Your <span className="text-gold-gradient">Diwali</span>
              </h1>

              <p className="text-[#B9B8C7] text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Premium Sivakasi Crackers Delivered to Your Door. Direct factory wholesale pricing from Sivakasi, Tamil Nadu with safe express delivery across India.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-black px-8 py-3.5 rounded-2xl shadow-xl gold-glow text-sm sm:text-base transition-all transform hover:-translate-y-0.5 touch-target"
                >
                  Shop Crackers →
                </Link>
                <Link
                  href="/products#categories"
                  className="bg-[#151A35] border border-[#292E4D] hover:border-[#6D3FD6] text-[#FFF9EA] hover:text-[#F5C451] font-bold px-6 py-3.5 rounded-2xl text-sm transition-all touch-target"
                >
                  Explore Categories
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#292E4D] max-w-md mx-auto lg:mx-0 text-xs text-[#B9B8C7] font-semibold">
                <div>
                  <span className="block text-[#F5C451] font-black text-base font-display">100%</span>
                  Genuine Crackers
                </div>
                <div>
                  <span className="block text-[#F5C451] font-black text-base font-display">50% OFF</span>
                  Wholesale Savings
                </div>
                <div>
                  <span className="block text-[#4ADE80] font-black text-base font-display">Safe</span>
                  Express Transit
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative">
              <div className="relative mx-auto max-w-md bg-[#151A35]/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl purple-glow border border-[#6D3FD6]/50">
                <div className="flex items-center justify-between pb-4 border-b border-[#292E4D]">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h3 className="font-black text-[#FFF9EA] text-sm font-display">Festive Special Offer</h3>
                      <p className="text-[10px] text-[#F5C451] font-semibold">Limited Stock Available</p>
                    </div>
                  </div>
                  <span className="bg-[#6D3FD6] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">
                    50% OFF
                  </span>
                </div>

                <div className="py-6 text-center space-y-3">
                  <div className="text-6xl animate-bounce">🎁</div>
                  <h4 className="text-lg font-black text-[#FFE29A] font-display">Deluxe Family Festive Combo Pack</h4>
                  <p className="text-xs text-[#B9B8C7]">Contains 35 Assorted High-Quality Fireworks & Sparklers</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black text-[#F5C451] font-display">₹1,499</span>
                    <span className="text-sm text-[#B9B8C7] line-through">₹2,999</span>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="block w-full text-center bg-[#F5C451] text-[#080B1A] font-black py-3.5 rounded-xl hover:bg-[#FFE29A] transition-colors text-xs uppercase tracking-wider shadow-md"
                >
                  Explore All Offers Now
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BEST SELLERS CAROUSEL SECTION */}
      <section className="py-12 bg-[#080B1A] border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#FFF9EA] tracking-tight uppercase font-display shrink-0">
                Best Sellers
              </h2>
              <div className="text-xs font-bold text-[#F5C451] flex items-center gap-1 text-right mt-1 shrink-0">
                Swipe to explore <span className="text-sm leading-none">→</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#B9B8C7] font-medium mt-0.5">
              Most loved by our customers this season
            </p>
          </div>

          <BestSellersCarousel products={displayFeatured.map(p => ({
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
      <section id="categories" className="py-12 bg-[#080B1A] border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#FFF9EA] tracking-tight uppercase font-display shrink-0">
                Shop By Category
              </h2>
              <p className="text-xs sm:text-sm text-[#B9B8C7] font-medium">
                Browse our complete Sivakasi cracker collection
              </p>
            </div>
            <Link href="/products" className="text-xs font-bold text-[#F5C451] hover:text-[#FFE29A]">
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-[#151A35] hover:bg-[#11152E] border border-[#292E4D] hover:border-[#F5C451]/50 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl hover:shadow-[#F5C451]/10 flex flex-col items-center justify-between min-h-[140px]"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(245,196,81,0.2)]" />
                  ) : (
                    <span className="drop-shadow-[0_0_15px_rgba(245,196,81,0.4)]">{cat.icon || "🎆"}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#FFF9EA] group-hover:text-[#F5C451] transition-colors line-clamp-1 font-display">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-[#B9B8C7] font-medium block mt-1">
                    {cat._count.products} Products
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FESTIVAL OFFER BANNER / DIWALI COMBO */}
      <section className="py-12 bg-[#11152E] border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#6D3FD6]/30 via-[#151A35] to-[#6D3FD6]/30 border border-[#6D3FD6]/50 p-8 sm:p-12 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 max-w-xl">
              <span className="bg-[#6D3FD6] text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                Exclusive Festival Offer
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#FFF9EA] font-display">
                Diwali Family Combo
              </h3>
              <p className="text-xs sm:text-sm text-[#B9B8C7]">
                Everything you need for a spectacular celebration. Contact us for custom wholesale package pricing.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/products"
                className="inline-block bg-[#F5C451] hover:bg-[#FFE29A] text-[#080B1A] font-black px-8 py-4 rounded-2xl shadow-xl gold-glow text-sm transition-all transform hover:scale-105"
              >
                Shop Combo Packs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SIVAKASI: Exactly 4 Centered Cards */}
      <section className="py-16 bg-[#080B1A] text-[#FFF9EA] border-b border-[#292E4D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#FFF9EA] font-display">
              Why Choose <span className="text-gold-gradient">{settings.storeName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#B9B8C7]">
              We take pride in delivering genuine fireworks and exceptional service direct from Sivakasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Authentic Sivakasi Crackers */}
            <div className="bg-[#151A35] border border-[#292E4D] hover:border-[#6D3FD6] p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6D3FD6]/20 group">
              <div className="w-14 h-14 rounded-2xl bg-[#6D3FD6]/20 border border-[#6D3FD6]/40 flex items-center justify-center text-3xl text-[#F5C451] shadow-sm group-hover:scale-110 transition-transform">
                🏭
              </div>
              <h3 className="font-extrabold text-base text-[#FFF9EA]">Authentic Sivakasi Crackers</h3>
              <p className="text-xs text-[#B9B8C7] leading-relaxed">
                Genuine fireworks sourced directly from Sivakasi factories.
              </p>
            </div>

            {/* Card 2: Quality You Can Trust */}
            <div className="bg-[#151A35] border border-[#292E4D] hover:border-[#6D3FD6] p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6D3FD6]/20 group">
              <div className="w-14 h-14 rounded-2xl bg-[#6D3FD6]/20 border border-[#6D3FD6]/40 flex items-center justify-center text-3xl text-[#F5C451] shadow-sm group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-[#FFF9EA]">Quality You Can Trust</h3>
              <p className="text-xs text-[#B9B8C7] leading-relaxed">
                Carefully selected products with strict quality and safety checks.
              </p>
            </div>

            {/* Card 3: Best Festival Prices */}
            <div className="bg-[#151A35] border border-[#292E4D] hover:border-[#6D3FD6] p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6D3FD6]/20 group">
              <div className="w-14 h-14 rounded-2xl bg-[#6D3FD6]/20 border border-[#6D3FD6]/40 flex items-center justify-center text-3xl text-[#F5C451] shadow-sm group-hover:scale-110 transition-transform">
                🏷️
              </div>
              <h3 className="font-extrabold text-base text-[#FFF9EA]">Best Festival Prices</h3>
              <p className="text-xs text-[#B9B8C7] leading-relaxed">
                Factory wholesale pricing with massive festive savings.
              </p>
            </div>

            {/* Card 4: Safe & Reliable Service */}
            <div className="bg-[#151A35] border border-[#292E4D] hover:border-[#6D3FD6] p-6 rounded-2xl space-y-3 text-center flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6D3FD6]/20 group">
              <div className="w-14 h-14 rounded-2xl bg-[#6D3FD6]/20 border border-[#6D3FD6]/40 flex items-center justify-center text-3xl text-[#F5C451] shadow-sm group-hover:scale-110 transition-transform">
                🚚
              </div>
              <h3 className="font-extrabold text-base text-[#FFF9EA]">Safe & Reliable Service</h3>
              <p className="text-xs text-[#B9B8C7] leading-relaxed">
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