import React from "react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import InvoiceDocument from "@/components/ui/InvoiceDocument";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

async function getOrCreateInvoiceNumber(orderId: number, createdAt: Date): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, invoiceNumber: true }
  });
  if (!order) throw new Error("Order not found");
  if (order.invoiceNumber) return order.invoiceNumber;

  const year = createdAt.getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const month = createdAt.getMonth() + 1;
  const fiscalYear = month >= 4 ? `${year}-${nextYear}` : `${year - 1}-${year.toString().slice(-2)}`;
  const generated = `SC/${fiscalYear}/${orderId.toString().padStart(6, "0")}`;

  await prisma.order.update({
    where: { id: orderId },
    data: { invoiceNumber: generated }
  });

  return generated;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) notFound();

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    }),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  // Get or create unique invoice number and persist to DB
  const invoiceNumber = await getOrCreateInvoiceNumber(order.id, order.createdAt);
  order.invoiceNumber = invoiceNumber;

  // Fetch product information to obtain HSN and MRP
  const productIds = order.items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, hsnCode: true, taxRate: true, mrp: true, price: true }
  });

  // Convert prisma decimals to numbers for InvoiceDocument compatibility
  const plainProducts = products.map(p => ({
    id: p.id,
    hsnCode: p.hsnCode,
    taxRate: Number(p.taxRate),
    mrp: Number(p.mrp),
    price: Number(p.price),
  }));

  const plainOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    totalAmount: Number(order.totalAmount),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price),
      total: Number(item.total),
    })),
    payments: order.payments.map(pay => ({
      paymentMethod: pay.paymentMethod,
      paymentRef: pay.paymentRef,
    })),
  };

  const plainSettings = {
    storeName: settings.storeName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    gstin: settings.gstin,
    legalName: settings.legalName,
    invoiceTerms: settings.invoiceTerms,
    isGstRegistered: settings.isGstRegistered,
    signatureImage: settings.signatureImage,
  };

  return (
    <InvoiceDocument
      order={plainOrder}
      settings={plainSettings}
      products={plainProducts}
    />
  );
}
