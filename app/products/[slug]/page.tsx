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
    <div className="min-h-screen flex flex-col bg-[#080B1A] text-[#FFF9EA]">
      <Header settings={settings} user={session} />

      {/* Breadcrumb Navigation */}
      <div className="bg-[#11152E] border-b border-[#292E4D] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs font-semibold text-[#B9B8C7] flex items-center gap-2">
          <Link href="/" className="hover:text-[#F5C451] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#F5C451] transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-[#F5C451] transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-[#FFF9EA] line-clamp-1">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="bg-[#151A35] rounded-3xl border border-[#292E4D] shadow-xl p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Media Gallery Column */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 bg-[#080B1A] rounded-2xl overflow-hidden border border-[#292E4D] shadow-inner">
                <img
                  src={product.image || fallbackImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-[#6D3FD6] text-white font-black text-xs px-3 py-1 rounded-lg uppercase shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.badge && (
                  <span className="absolute top-4 right-4 bg-[#F5C451] text-[#080B1A] font-black text-xs px-3 py-1 rounded-lg uppercase shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Package & Quality Guarantee Badges */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold text-[#B9B8C7]">
                <div className="bg-[#11152E] border border-[#292E4D] p-2.5 rounded-xl">
                  <span className="block text-[#B9B8C7]/60 text-[10px] uppercase">Package Qty</span>
                  <span className="text-[#F5C451]">{product.quantity}</span>
                </div>
                <div className="bg-[#11152E] border border-[#292E4D] p-2.5 rounded-xl">
                  <span className="block text-[#B9B8C7]/60 text-[10px] uppercase">Origin</span>
                  <span className="text-[#FFF9EA]">Sivakasi, TN</span>
                </div>
                <div className="bg-[#11152E] border border-[#292E4D] p-2.5 rounded-xl">
                  <span className="block text-[#B9B8C7]/60 text-[10px] uppercase">Stock Status</span>
                  <span className={product.stock > 0 ? "text-[#4ADE80]" : "text-[#B9B8C7]/60"}>
                    {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details Column */}
            <div className="space-y-6">
              
              <div>
                <span className="text-xs font-black text-[#F5C451] uppercase tracking-widest block mb-1">
                  {product.category.name}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#FFF9EA] tracking-tight leading-snug font-display">
                  {product.name}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="bg-[#11152E]/60 border border-[#292E4D] p-4 rounded-2xl flex items-baseline justify-between">
                <div>
                  <span className="text-[#B9B8C7] text-xs block font-medium">Discounted Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[#F5C451] font-display">
                      ₹{priceNum.toLocaleString("en-IN")}
                    </span>
                    <span className="text-base text-[#B9B8C7] line-through font-medium">
                      ₹{mrpNum.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {savings > 0 && (
                  <div className="text-right">
                    <span className="bg-[#6D3FD6] text-white font-extrabold text-xs px-2.5 py-1 rounded-md inline-block shadow-sm">
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
              <div className="border-t border-[#292E4D] pt-6 space-y-3">
                <h3 className="font-extrabold text-sm text-[#FFF9EA] uppercase tracking-wider font-display">
                  Product Description & Guidelines
                </h3>
                <p className="text-xs text-[#B9B8C7] leading-relaxed">
                  {product.description ||
                    `Premium quality ${product.name} manufactured in Sivakasi using genuine raw materials. Certified for safe sound emissions, vibrant spark output, and long duration performance.`}
                </p>
                <div className="bg-[#11152E] p-4 rounded-xl border border-[#292E4D] text-xs text-[#B9B8C7] space-y-1">
                  <span className="font-bold block text-[#FFF9EA]">⚠️ Safety Warning:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[#B9B8C7]/80">
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
            <h2 className="text-xl font-black text-[#FFF9EA] tracking-tight font-display">
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
