import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";
import AdminProductTable from "./AdminProductTable";

interface AdminProductsPageProps {
  searchParams: Promise<{ q?: string; categoryId?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const { q = "", categoryId = "" } = await searchParams;

  const whereClause: any = {};
  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (categoryId) {
    whereClause.categoryId = parseInt(categoryId);
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminNav user={session}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-red-600 uppercase tracking-widest block">
              Inventory & Catalog Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Products ({products.length})
            </h1>
          </div>

          <Link
            href="/admin/products/new"
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow transition-all inline-flex items-center gap-2"
          >
            <span>➕ Add New Product</span>
          </Link>
        </div>

        {/* Client Product Table with Search & Interactive Actions */}
        <AdminProductTable
          initialProducts={products.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: Number(p.price),
            mrp: Number(p.mrp),
            discount: p.discount,
            quantity: p.quantity,
            stock: p.stock,
            active: p.active,
            featured: p.featured,
            badge: p.badge,
            categoryName: p.category.name,
            categoryId: p.categoryId,
          }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          initialSearch={q}
          initialCategoryId={categoryId}
        />

      </div>
    </AdminNav>
  );
}
