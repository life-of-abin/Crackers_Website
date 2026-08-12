import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../../AdminNav";
import EditProductForm from "./EditProductForm";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: EditPageProps) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <AdminNav user={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-red-600 uppercase tracking-widest block">
              Inventory Management
            </span>
            <h1 className="text-2xl font-black text-slate-900">Edit Product: {product.name}</h1>
          </div>
          <Link href="/admin/products" className="text-xs font-bold text-slate-600 hover:text-slate-900">
            ← Back to Products
          </Link>
        </div>

        <EditProductForm
          product={{
            id: product.id,
            name: product.name,
            categoryId: product.categoryId,
            price: Number(product.price),
            mrp: Number(product.mrp),
            quantity: product.quantity,
            stock: product.stock,
            description: product.description,
            image: product.image,
            badge: product.badge,
            featured: product.featured,
            active: product.active,
          }}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </AdminNav>
  );
}
