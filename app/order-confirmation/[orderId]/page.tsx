import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import FireworksCanvas from "@/components/ui/FireworksCanvas";
import RocketAnimation from "@/components/ui/RocketAnimation";

import OrderConfirmationClient from "./OrderConfirmationClient";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const numericId = parseInt(orderId, 10);
  if (isNaN(numericId)) notFound();

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id: numericId },
      include: { items: true, payments: true },
    }),
    getStoreSettings(),
  ]);

  if (!order) notFound();

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

  return (
    <OrderConfirmationClient
      order={{
        ...order,
        orderType: order.orderType ?? "DELIVERY",
        deliveryCharge: Number(order.deliveryCharge ?? 0),
        deliveryConfirmed: order.deliveryConfirmed ?? false,
      }}
      settings={settings}
      formattedId={formattedId}
      displayPaymentMethod={displayPaymentMethod}
      orderDate={orderDate}
    />
  );
}
