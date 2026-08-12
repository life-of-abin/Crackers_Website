import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();

    if (!query || query.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      },
      take: 8,
      orderBy: { purchases: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        mrp: true,
        discount: true,
        image: true,
        stock: true,
        category: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ results: products });
  } catch (error: any) {
    console.error("Live search error:", error);
    return NextResponse.json({ error: "Failed to search products." }, { status: 500 });
  }
}
