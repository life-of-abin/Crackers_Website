import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the 10 most recent orders for notification inspection
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        phone: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      orders: recentOrders.map((ord) => ({
        id: ord.id,
        customerName: ord.customerName,
        phone: ord.phone,
        totalAmount: Number(ord.totalAmount),
        orderStatus: ord.orderStatus,
        paymentStatus: ord.paymentStatus,
        createdAt: ord.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("Admin notification API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
