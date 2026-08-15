import React from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch real-time dashboard metrics from PostgreSQL
  const [
    totalOrdersCount,
    pendingOrdersCount,
    completedOrdersCount,
    revenueAgg,
    totalProductsCount,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    inactiveCount,
    lowStockProducts,
    recentOrders,
    categoriesWithProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: { in: ["PLACED", "CONFIRMED", "PROCESSING", "PACKED"] } } }),
    prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { stock: { gt: 20 }, active: true } }),
    prisma.product.count({ where: { stock: { lte: 20, gt: 0 }, active: true } }),
    prisma.product.count({ where: { stock: 0, active: true } }),
    prisma.product.count({ where: { active: false } }),
    prisma.product.findMany({
      where: { stock: { lte: 20 }, active: true },
      take: 10,
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
      },
    }),
    prisma.order.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true,
            total: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { active: true },
      include: {
        products: {
          select: {
            purchases: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);

  // Map category sales analytics
  const categorySales = categoriesWithProducts
    .map((cat) => {
      const totalPurchases = cat.products.reduce((acc, p) => acc + (p.purchases || 0), 0);
      return {
        id: cat.id,
        name: cat.name,
        ordersCount: cat._count.products,
        totalPurchases,
      };
    })
    .sort((a, b) => b.totalPurchases - a.totalPurchases);

  // Format low stock list
  const formattedLowStock = lowStockProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    stock: p.stock,
  }));

  // Format orders list
  const formattedOrders = recentOrders.map((ord) => ({
    id: ord.id,
    customerName: ord.customerName,
    phone: ord.phone,
    email: ord.email,
    totalAmount: Number(ord.totalAmount),
    paymentStatus: ord.paymentStatus,
    orderStatus: ord.orderStatus,
    createdAt: ord.createdAt.toISOString(),
    items: ord.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total),
    })),
  }));

  return (
    <AdminNav user={session}>
      <AdminDashboardClient
        totalRevenue={totalRevenue}
        totalOrdersCount={totalOrdersCount}
        pendingOrdersCount={pendingOrdersCount}
        completedOrdersCount={completedOrdersCount}
        totalProductsCount={totalProductsCount}
        inStockCount={inStockCount}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        inactiveCount={inactiveCount}
        lowStockList={formattedLowStock}
        recentOrders={formattedOrders}
        categorySales={categorySales}
      />
    </AdminNav>
  );
}
