import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate real PDF using jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const formattedOrderId = `ORD-2026-${String(order.id).padStart(6, "0")}`;
    const formattedInvoiceId = `INV-2026-${String(order.id).padStart(6, "0")}`;
    const orderDateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Colors
    const primaryRed = [185, 28, 28]; // #b91c1c
    const textDark = [15, 23, 42];   // #0f172a
    const textGray = [100, 116, 139]; // #64748b

    // Header Banner
    doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.rect(0, 0, 210, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("SRI SIVAKASI CRACKERS", 14, 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Direct From Sivakasi Factory • Genuine Quality Fireworks", 14, 22);
    doc.text("📞 9629525907  |  ✉ abinesh.ece200@gmail.com", 200, 22, { align: "right" });

    // Invoice Meta
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TAX INVOICE", 14, 38);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No: ${formattedInvoiceId}`, 200, 38, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Order Reference: ${formattedOrderId}`, 200, 43, { align: "right" });
    doc.text(`Order Date: ${orderDateStr}`, 200, 48, { align: "right" });
    doc.text(`Payment Status: ${order.paymentStatus}`, 200, 53, { align: "right" });

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 58, 200, 58);

    // Customer & Delivery Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CUSTOMER & DELIVERY DETAILS", 14, 65);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text("Billed & Delivered To:", 14, 71);

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont("helvetica", "bold");
    doc.text(order.customerName || "Valued Customer", 14, 76);

    doc.setFont("helvetica", "normal");
    const cleanPhone = (order.phone || "").replace(/[^0-9]/g, "").slice(-10);
    doc.text(`Mobile: ${cleanPhone}`, 14, 81);
    doc.text(`Email: ${order.email || "N/A"}`, 14, 86);

    const fullAddr = `${order.address}${order.landmark ? `, Near ${order.landmark}` : ""}, ${order.city}, ${order.district || ""}, ${order.state} - ${order.pincode}, India`;
    const splitAddr = doc.splitTextToSize(fullAddr, 100);
    doc.text(splitAddr, 14, 91);

    // Items Table Header
    const tableTop = 110;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, tableTop, 186, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("#", 18, tableTop + 5.5);
    doc.text("PRODUCT DESCRIPTION", 28, tableTop + 5.5);
    doc.text("QTY", 120, tableTop + 5.5, { align: "right" });
    doc.text("UNIT PRICE", 155, tableTop + 5.5, { align: "right" });
    doc.text("TOTAL (INR)", 195, tableTop + 5.5, { align: "right" });

    // Items Table Rows
    let yPos = tableTop + 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    order.items.forEach((item, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(String(index + 1), 18, yPos);
      const itemDesc = `${item.productName.slice(0, 32)} (${item.packSize || "10 Pcs"}/${item.unitType || "BOX"})`;
      doc.text(itemDesc, 28, yPos);
      doc.text(`${item.quantity} ${item.unitType || "BOX"}(S)`, 120, yPos, { align: "right" });
      doc.text(`Rs. ${Number(item.price).toLocaleString("en-IN")}`, 155, yPos, { align: "right" });
      doc.text(`Rs. ${Number(item.total).toLocaleString("en-IN")}`, 195, yPos, { align: "right" });

      yPos += 7;
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos - 3, 200, yPos - 3);
    });

    // Summary Box
    yPos += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Subtotal:", 145, yPos);
    doc.text(`Rs. ${Number(order.subtotal).toLocaleString("en-IN")}`, 195, yPos, { align: "right" });

    yPos += 5;
    doc.text("Shipping & Delivery:", 145, yPos);
    doc.text(Number(order.shipping) === 0 ? "FREE" : `Rs. ${Number(order.shipping).toLocaleString("en-IN")}`, 195, yPos, { align: "right" });

    yPos += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text("Grand Total:", 145, yPos);
    doc.text(`Rs. ${Number(order.totalAmount).toLocaleString("en-IN")}`, 195, yPos, { align: "right" });

    // Footer Guarantee
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text("Thank you for shopping with Sri Sivakasi Crackers! Genuine Sivakasi Factory Direct Fireworks.", 105, 280, { align: "center" });

    const pdfBuffer = doc.output("arraybuffer");

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${formattedOrderId}_Invoice.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Invoice generation error:", error);
    return NextResponse.json({ error: "Failed to generate invoice PDF." }, { status: 500 });
  }
}
