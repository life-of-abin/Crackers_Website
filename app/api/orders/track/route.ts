import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidGmailFormat } from "@/lib/pincode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawOrderId = String(body.orderId || "").trim();
    const rawEmail = String(body.email || "").trim().toLowerCase();

    if (!rawOrderId) {
      return NextResponse.json(
        { error: "Please enter your Order ID." },
        { status: 400 }
      );
    }

    if (!rawEmail || !isValidGmailFormat(rawEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid Gmail address ending with @gmail.com." },
        { status: 400 }
      );
    }

    // Reject offline store bills (OFF-2026-XXXX) explicitly
    if (rawOrderId.toUpperCase().startsWith("OFF") || rawOrderId.toUpperCase().includes("OFF-")) {
      return NextResponse.json(
        { error: "Offline store bills (OFF-...) are in-store counter receipts and cannot be tracked. Track Order is strictly for online website purchases." },
        { status: 400 }
      );
    }

    // Extract numeric order ID from strings like "ORD-2026-000123" or "123"
    const numericMatch = rawOrderId.match(/\d+/g);
    let orderIdNum = 0;
    if (numericMatch && numericMatch.length > 0) {
      orderIdNum = parseInt(numericMatch[numericMatch.length - 1], 10);
    }

    if (!orderIdNum || isNaN(orderIdNum)) {
      return NextResponse.json(
        { error: "Order details could not be found. Please check your Order ID and Gmail address." },
        { status: 404 }
      );
    }

    // Secure database lookup: BOTH Order ID and exact Gmail address must match, and strictly exclude OFFLINE store bills
    const order = await prisma.order.findFirst({
      where: {
        id: orderIdNum,
        email: rawEmail,
        orderType: { not: "OFFLINE" },
      },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            unitType: true,
            packSize: true,
            price: true,
            total: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order details could not be found. Please check your Order ID and Gmail address." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        formattedId: `ORD-2026-${String(order.id).padStart(6, "0")}`,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        orderType: order.orderType ?? "DELIVERY",
        deliveryCharge: Number(order.deliveryCharge ?? 0),
        deliveryConfirmed: order.deliveryConfirmed ?? false,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        totalAmount: Number(order.totalAmount),
        customerName: order.customerName,
        city: order.city,
        district: order.district,
        state: order.state,
        pincode: order.pincode,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          unitType: item.unitType || "BOX",
          packSize: item.packSize || "10 Pieces",
          price: Number(item.price),
          total: Number(item.total),
        })),
      },
    });
  } catch (error: any) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { error: "An error occurred while tracking your order. Please try again." },
      { status: 500 }
    );
  }
}
