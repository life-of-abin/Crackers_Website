import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";
import { generateInvoiceNumber } from "@/lib/payment-utils";

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
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify payment status before serving paid invoice
    const isPaid =
      order.paymentStatus === "PAID" ||
      order.paymentStatus === "TEST_PAID" ||
      order.paymentStatus === "SUCCESS";

    if (!isPaid) {
      return NextResponse.json(
        { error: "Invoice is available only after payment confirmation." },
        { status: 403 }
      );
    }

    // For DELIVERY orders: require delivery charge to be confirmed first
    const orderType = (order as any).orderType ?? "DELIVERY";
    const deliveryConfirmed = (order as any).deliveryConfirmed ?? false;
    const deliveryCharge = Number((order as any).deliveryCharge ?? 0);

    if (orderType === "DELIVERY" && !deliveryConfirmed) {
      return NextResponse.json(
        { error: "Invoice cannot be generated until the delivery charge has been confirmed by the admin." },
        { status: 403 }
      );
    }

    const invoiceNumber = order.invoiceNumber || generateInvoiceNumber(order.id, order.createdAt);
    const orderNumber = `ORD-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(6, "0")}`;
    const orderDateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const paymentMethod = order.paymentMethod || order.payments?.[0]?.paymentMethod || "UPI / Online";
    const paymentTxRef = order.paymentId || order.payments?.[0]?.paymentRef || "Verified";

    // Generate real PDF using jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Theme Colors
    const primaryPurple = [109, 63, 214]; // #6D3FD6
    const accentGold = [245, 196, 81];    // #F5C451
    const textNavy = [15, 23, 42];        // #0F172A (Deep Navy)
    const textMuted = [100, 116, 139];    // #64748B
    const borderGray = [226, 232, 240];   // #E2E8F0

    // Header Purple Bar
    doc.setFillColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
    doc.rect(0, 0, 210, 26, "F");

    // Header Gold Accent Bar
    doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
    doc.rect(0, 26, 210, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SRI SIVAKASI CRACKERS", 14, 15);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("Direct Sivakasi Factory Quality • Festive Fireworks", 14, 21);
    doc.text("📞 +91 9629525907  |  ✉ abinesh.ece2003@gmail.com", 196, 21, { align: "right" });

    // Invoice Header Meta Block
    doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TAX INVOICE", 14, 38);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Invoice No: ${invoiceNumber}`, 196, 38, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(`Order Reference: ${orderNumber}`, 196, 43, { align: "right" });
    doc.text(`Date: ${orderDateStr}`, 196, 48, { align: "right" });
    doc.text(`Payment Status: PAID (${paymentMethod})`, 196, 53, { align: "right" });
    doc.text(`Transaction / UTR: ${paymentTxRef}`, 196, 58, { align: "right" });

    // Divider Line
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(14, 62, 196, 62);

    // Customer & Shipping Address Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
    doc.text(orderType === "PICKUP" ? "BILLED TO / STORE PICKUP" : "BILLED & DELIVERED TO", 14, 69);

    // Order type badge text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const orderTypeBadge = orderType === "PICKUP" ? "[ STORE PICKUP — FREE ]" : `[ HOME DELIVERY — Delivery Charge: ${deliveryCharge > 0 ? `Rs.${deliveryCharge.toLocaleString("en-IN")}` : "FREE"}  ]`;
    doc.setTextColor(orderType === "PICKUP" ? 5 : 109, orderType === "PICKUP" ? 150 : 63, orderType === "PICKUP" ? 105 : 214);
    doc.text(orderTypeBadge, 196, 69, { align: "right" });

    doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(order.customerName || "Valued Customer", 14, 75);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const cleanPhone = (order.phone || "").replace(/[^0-9]/g, "").slice(-10);
    doc.text(`Mobile: +91 ${cleanPhone}`, 14, 80);
    doc.text(`Email: ${order.email || "N/A"}`, 14, 84);

    const fullAddressStr = `${order.address}${order.landmark ? `, Near ${order.landmark}` : ""}, ${order.city}, ${order.district ? `${order.district}, ` : ""}${order.state} - ${order.pincode}, India`;
    const splitAddr = doc.splitTextToSize(fullAddressStr, 110);
    doc.text(splitAddr, 14, 88);

    // Items Table Header
    const tableTop = 104;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, tableTop, 182, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
    doc.text("#", 17, tableTop + 5.5);
    doc.text("PRODUCT NAME", 26, tableTop + 5.5);
    doc.text("QTY", 125, tableTop + 5.5, { align: "right" });
    doc.text("UNIT PRICE", 155, tableTop + 5.5, { align: "right" });
    doc.text("TOTAL (₹)", 192, tableTop + 5.5, { align: "right" });

    // Itemized Rows from Order Snapshot
    let yPos = tableTop + 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    order.items.forEach((item, idx) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(String(idx + 1), 17, yPos);
      const prodName = `${item.productName.slice(0, 38)} (${item.packSize || "10 Pcs"})`;
      doc.text(prodName, 26, yPos);
      doc.text(`${item.quantity} ${item.unitType || "BOX"}${item.quantity > 1 ? "ES" : ""}`, 125, yPos, { align: "right" });
      doc.text(`₹${Number(item.price).toLocaleString("en-IN")}`, 155, yPos, { align: "right" });
      doc.text(`₹${Number(item.total).toLocaleString("en-IN")}`, 192, yPos, { align: "right" });

      yPos += 7;
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.line(14, yPos - 3, 196, yPos - 3);
    });

    // Subtotal & Grand Total Summary Box
    yPos += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textNavy[0], textNavy[1], textNavy[2]);
    doc.text("Subtotal:", 140, yPos);
    doc.text(`₹${Number(order.subtotal).toLocaleString("en-IN")}`, 192, yPos, { align: "right" });

    yPos += 5;
    if (Number(order.discount) > 0) {
      doc.text("Discount:", 140, yPos);
      doc.text(`- ₹${Number(order.discount).toLocaleString("en-IN")}`, 192, yPos, { align: "right" });
      yPos += 5;
    }

    doc.text(orderType === "PICKUP" ? "Pickup Charge:" : "Delivery Charge:", 140, yPos);
    if (orderType === "PICKUP") {
      doc.text("FREE", 192, yPos, { align: "right" });
    } else {
      doc.text(deliveryCharge > 0 ? `Rs.${deliveryCharge.toLocaleString("en-IN")}` : "FREE", 192, yPos, { align: "right" });
    }

    yPos += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryPurple[0], primaryPurple[1], primaryPurple[2]);
    doc.text("Grand Total:", 140, yPos);
    doc.text(`₹${Number(order.totalAmount).toLocaleString("en-IN")}`, 192, yPos, { align: "right" });

    // Footer & Terms
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Terms & Instructions: All crackers manufactured and shipped from Sivakasi, Tamil Nadu. Store in a cool dry place.", 105, 278, { align: "center" });
    doc.text("Thank you for your business with Sri Sivakasi Crackers!", 105, 283, { align: "center" });

    const pdfBuffer = doc.output("arraybuffer");

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // ✅ CORRECT filename: {invoiceNumber}.pdf
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Invoice generation error:", error);
    return NextResponse.json({ error: "Failed to generate invoice PDF." }, { status: 500 });
  }
}
