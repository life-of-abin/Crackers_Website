import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const session = await requireAdmin();

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <AdminNav user={session}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-red-600 uppercase tracking-widest block">
              Store Structure
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Manage Product Categories ({categories.length})
            </h1>
          </div>
        </div>

        <CategoryManager
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.icon,
            active: c.active,
            productCount: c._count.products,
          }))}
        />
      </div>
    </AdminNav>
  );
}
