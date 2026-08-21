import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";

import OrderConfirmationClient from "./OrderConfirmationClient";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ token?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const sParams = searchParams ? await searchParams : {};
  const queryToken = sParams.token;

  let order = null;

  // 1. Try lookup by unique unguessable orderToken (e.g., /order-confirmation/ord_tok_...)
  if (orderId.startsWith("ord_tok_") || isNaN(parseInt(orderId, 10))) {
    order = await prisma.order.findFirst({
      where: { orderToken: orderId },
      include: { items: true, payments: true },
    });
  } else {
    // 2. If accessed by numeric ID, strictly require matching secret token parameter
    const numericId = parseInt(orderId, 10);
    if (!isNaN(numericId) && queryToken) {
      const candidate = await prisma.order.findUnique({
        where: { id: numericId },
        include: { items: true, payments: true },
      });
      if (candidate && candidate.orderToken === queryToken) {
        order = candidate;
      }
    }
  }

  // Block unauthorized access to sequential IDs — return 404 if token doesn't match
  if (!order) notFound();

  // Offline store bills are in-store counter receipts — redirect directly to printable invoice document
  if (order.orderType === "OFFLINE") {
    redirect(`/orders/${order.id}/invoice`);
  }

  const settings = await getStoreSettings();

  const formattedId = order.invoiceNumber
    ? order.invoiceNumber
    : `#ORD-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(6, "0")}`;

  const paymentMethodNames: Record<string, string> = {
    GPAY: "Google Pay",
    PHONEPE: "PhonePe",
    PAYTM: "Paytm",
    BHIM: "BHIM",
    UPI_QR: "Paytm / UPI QR",
    QR: "Paytm / UPI QR",
  };

  const rawMethod = order.paymentMethod || order.payments?.[0]?.paymentMethod || "UPI_QR";
  const displayPaymentMethod = paymentMethodNames[rawMethod] || rawMethod;

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Serialize all Prisma Decimal fields before passing to the Client Component.
  // Next.js cannot serialize Decimal objects across the Server→Client boundary.
  const plainOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    totalAmount: Number(order.totalAmount),
    orderType: order.orderType ?? "DELIVERY",
    deliveryCharge: Number(order.deliveryCharge ?? 0),
    deliveryConfirmed: order.deliveryConfirmed ?? false,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      total: Number(item.total),
      taxRate: item.taxRate != null ? Number(item.taxRate) : null,
      taxableValue: item.taxableValue != null ? Number(item.taxableValue) : null,
      cgstAmount: item.cgstAmount != null ? Number(item.cgstAmount) : null,
      sgstAmount: item.sgstAmount != null ? Number(item.sgstAmount) : null,
      igstAmount: item.igstAmount != null ? Number(item.igstAmount) : null,
    })),
    payments: order.payments.map((pay) => ({
      id: pay.id,
      orderId: pay.orderId,
      paymentMethod: pay.paymentMethod,
      paymentRef: pay.paymentRef,
      amount: Number(pay.amount),
      status: pay.status,
      createdAt: pay.createdAt.toISOString(),
      updatedAt: pay.updatedAt.toISOString(),
    })),
  };

  return (
    <OrderConfirmationClient
      order={plainOrder}
      settings={settings}
      formattedId={formattedId}
      displayPaymentMethod={displayPaymentMethod}
      orderDate={orderDate}
    />
  );
}
