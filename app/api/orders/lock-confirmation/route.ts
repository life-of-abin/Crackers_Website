import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, token } = body;

    const numericId = parseInt(String(orderId), 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Find order by ID or orderToken
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: numericId },
          ...(token ? [{ orderToken: String(token) }] : []),
        ],
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Lock order confirmation by setting orderToken to LOCKED_<id>
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderToken: `LOCKED_${order.id}`,
      },
    });

    return NextResponse.json({ success: true, message: "Order confirmation locked successfully" });
  } catch (error) {
    console.error("Failed to lock order confirmation:", error);
    return NextResponse.json({ error: "Failed to lock order confirmation" }, { status: 500 });
  }
}
