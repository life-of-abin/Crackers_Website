import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import ProductDetailActions from "./ProductDetailActions";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const settings = await getStoreSettings();
  const session = await getSession();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.active) {
    notFound();
  }

  // Related products in same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      active: true,
    },
    include: { category: true },
    take: 4,
  });

  const priceNum = Number(product.price);
  const mrpNum = Number(product.mrp);
  const savings = Math.max(0, mrpNum - priceNum);
  const discountPercent = Math.round((savings / mrpNum) * 100);

  const fallbackImage = `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <Header settings={settings} user={session} />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-semibold text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#6D3FD6] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#6D3FD6] transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-[#6D3FD6] transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 line-clamp-1">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Media Gallery Column */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <img
                  src={product.image || fallbackImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-[#6D3FD6] text-white font-black text-xs px-3 py-1 rounded-lg uppercase shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.badge && (
                  <span className="absolute top-4 right-4 bg-[#F5C451] text-amber-950 font-black text-xs px-3 py-1 rounded-lg uppercase shadow-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Package & Quality Guarantee Badges */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold text-slate-600">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <span className="block text-slate-400 text-[10px] uppercase">Package Qty</span>
                  <span className="text-[#6D3FD6] font-extrabold">{product.quantity}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <span className="block text-slate-400 text-[10px] uppercase">Origin</span>
                  <span className="text-slate-900 font-extrabold">Sivakasi, TN</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <span className="block text-slate-400 text-[10px] uppercase">Stock Status</span>
                  <span className={product.stock > 0 ? "text-emerald-600 font-extrabold" : "text-slate-400"}>
                    {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details Column */}
            <div className="space-y-6">
              
              <div>
                <span className="text-xs font-extrabold text-[#6D3FD6] uppercase tracking-widest block mb-1">
                  {product.category.name}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug font-display">
                  {product.name}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-2xl flex items-baseline justify-between">
                <div>
                  <span className="text-slate-500 text-xs block font-medium">Discounted Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[#6D3FD6] font-display">
                      ₹{priceNum.toLocaleString("en-IN")}
                    </span>
                    <span className="text-base text-slate-400 line-through font-medium">
                      ₹{mrpNum.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {savings > 0 && (
                  <div className="text-right">
                    <span className="bg-[#6D3FD6] text-white font-extrabold text-xs px-2.5 py-1 rounded-md inline-block shadow-xs">
                      SAVE ₹{savings.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Component */}
              <ProductDetailActions
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: priceNum,
                  mrp: mrpNum,
                  image: product.image,
                  quantity: product.quantity,
                  stock: product.stock,
                }}
              />

              {/* Description & Safety Details */}
              <div className="border-t border-slate-200 pt-6 space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider font-display">
                  Product Description & Guidelines
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description ||
                    `Premium quality ${product.name} manufactured in Sivakasi using genuine raw materials. Certified for safe sound emissions, vibrant spark output, and long duration performance.`}
                </p>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-bold block text-amber-950">⚠️ Safety Warning:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                    <li>Always light outdoors under adult supervision.</li>
                    <li>Maintain a safe distance of at least 5 meters.</li>
                    <li>Keep water or sand bucket nearby.</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-display">
              Related {product.category.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={{
                    id: rel.id,
                    slug: rel.slug,
                    name: rel.name,
                    price: Number(rel.price),
                    mrp: Number(rel.mrp),
                    discount: rel.discount,
                    quantity: rel.quantity,
                    image: rel.image,
                    badge: rel.badge,
                    stock: rel.stock,
                    category: rel.category,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
