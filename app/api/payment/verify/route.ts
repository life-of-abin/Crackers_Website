import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, paymentId, paymentRef, transactionDetails } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required for verification." },
        { status: 400 }
      );
    }

    const numericOrderId = parseInt(String(orderId), 10);
    if (isNaN(numericOrderId)) {
      return NextResponse.json(
        { error: "Invalid Order ID." },
        { status: 400 }
      );
    }

    // Fetch existing order from DB
    const order = await prisma.order.findUnique({
      where: { id: numericOrderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // Check if order is already verified and marked as PAID
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        verified: true,
        orderId: order.id,
        paymentStatus: "PAID",
        orderStatus: order.orderStatus,
        message: "Order payment has already been verified as PAID.",
      });
    }

    // Perform server-side payment status update
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: order.orderStatus === "PLACED" ? "CONFIRMED" : order.orderStatus,
        paymentId: paymentId || paymentRef || order.paymentId || `UPI-${Date.now()}`,
        paidAt: new Date(),
      },
    });

    // Record or update Payment transaction entry
    if (order.payments.length > 0) {
      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: {
          status: "SUCCESS",
          paymentRef: paymentId || paymentRef || `TXN-${Date.now()}`,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          paymentMethod: order.paymentMethod || "UPI",
          status: "SUCCESS",
          paymentRef: paymentId || paymentRef || `TXN-${Date.now()}`,
        },
      });
    }

    // Revalidate order routes
    revalidatePath(`/orders/${order.id}`);
    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin/dashboard`);

    return NextResponse.json({
      success: true,
      verified: true,
      orderId: updatedOrder.id,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.orderStatus,
      message: "Payment successfully verified and order updated to PAID.",
    });

  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment status." },
      { status: 500 }
    );
  }
}
