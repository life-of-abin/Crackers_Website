import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone } from "@/lib/pincode";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") || searchParams.get("phone") || searchParams.get("email") || "").trim();
    const idParam = searchParams.get("id");

    if (idParam) {
      const parsedId = parseInt(idParam.replace(/[^0-9]/g, ""), 10);
      const dbId = parsedId > 2026000000 ? parsedId - 2026000000 : parsedId > 10000 ? parsedId - 10000 : parsedId;
      
      const order = await prisma.order.findFirst({
        where: { id: dbId },
        include: { items: true },
      });

      if (order) {
        return NextResponse.json({ orders: [order], order });
      }
    }

    if (!query) {
      return NextResponse.json({ orders: [] });
    }

    // Clean phone number or email search
    const cleanDigits = query.replace(/[^0-9]/g, "");
    const normalizedPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : "";

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          ...(query.includes("@") ? [{ email: { equals: query, mode: "insensitive" as const } }] : []),
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
          ...(cleanDigits.length >= 10 ? [{ phone: { contains: cleanDigits.slice(-10) } }] : []),
        ],
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Order lookup error:", error);
    return NextResponse.json({ error: "Failed to lookup customer orders." }, { status: 500 });
  }
}
