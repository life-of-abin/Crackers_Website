import React from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "../AdminNav";
import AdminDashboardClient from "./AdminDashboardClient";
import {
  validOnlineOrderWhere,
  pendingOnlineOrderWhere,
  completedOnlineOrderWhere,
} from "@/lib/orders";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Fetch real-time dashboard metrics from PostgreSQL with shared valid online order rules
  const [
    totalOrdersCount,
    pendingOrdersCount,
    completedOrdersCount,
    revenueAgg,
    offlineOrdersCount,
    offlineRevenueAgg,
    totalProductsCount,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    inactiveCount,
    lowStockProducts,
    recentOrders,
    offlineOrdersHistory,
    categoriesWithProducts,
    allProductsForPOS,
  ] = await Promise.all([
    // Valid Online Orders Count (Excludes CANCELLED/FAILED & OFFLINE)
    prisma.order.count({ where: validOnlineOrderWhere }),
    // Pending Online Orders Count
    prisma.order.count({ where: pendingOnlineOrderWhere }),
    // Completed Online Orders Count
    prisma.order.count({ where: completedOnlineOrderWhere }),
    // Total Online Sales Revenue
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { ...validOnlineOrderWhere, paymentStatus: "PAID" },
    }),
    // Offline Store Bills Count
    prisma.order.count({ where: { orderType: "OFFLINE" } }),
    // Offline Store Revenue
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderType: "OFFLINE" },
    }),
    // Inventory Counts
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { stock: { gt: 20 }, active: true } }),
    prisma.product.count({ where: { stock: { lte: 20, gt: 0 }, active: true } }),
    prisma.product.count({ where: { stock: 0, active: true } }),
    prisma.product.count({ where: { active: false } }),
    // Low Stock Alert List
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
    // Recent Valid Online Orders List (Take 25)
    prisma.order.findMany({
      where: validOnlineOrderWhere,
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
    // Offline Store Bills History (Take 100)
    prisma.order.findMany({
      where: { orderType: "OFFLINE" },
      take: 100,
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
    // Top Selling Categories
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
    // Active Products Catalog for Offline POS Billing System
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        mrp: true,
        stock: true,
        packSize: true,
        quantity: true,
        category: {
          select: { name: true },
        },
      },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);
  const offlineRevenue = Number(offlineRevenueAgg._sum.totalAmount || 0);

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

  // Format online orders list
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

  // Format offline orders list
  const formattedOfflineOrders = offlineOrdersHistory.map((ord) => ({
    id: ord.id,
    offlineBillNumber: ord.invoiceNumber || `OFF-${ord.id}`,
    customerName: ord.customerName,
    phone: ord.phone,
    totalAmount: Number(ord.totalAmount),
    subtotal: Number(ord.subtotal),
    discount: Number(ord.discount),
    paymentMethod: ord.paymentMethod || "Cash",
    createdAt: ord.createdAt.toISOString(),
    items: ord.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total),
    })),
  }));

  // Format products for POS Billing
  const formattedPosProducts = allProductsForPOS.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    mrp: Number(p.mrp),
    stock: p.stock,
    packSize: p.packSize || p.quantity || "10 Pieces",
    categoryName: p.category?.name,
  }));

  return (
    <AdminNav user={session}>
      <AdminDashboardClient
        totalRevenue={totalRevenue}
        totalOrdersCount={totalOrdersCount}
        pendingOrdersCount={pendingOrdersCount}
        completedOrdersCount={completedOrdersCount}
        offlineOrdersCount={offlineOrdersCount}
        offlineRevenue={offlineRevenue}
        totalProductsCount={totalProductsCount}
        inStockCount={inStockCount}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        inactiveCount={inactiveCount}
        lowStockList={formattedLowStock}
        recentOrders={formattedOrders}
        offlineOrdersHistory={formattedOfflineOrders}
        categorySales={categorySales}
        posProducts={formattedPosProducts}
      />
    </AdminNav>
  );
}
