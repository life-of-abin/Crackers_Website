import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: Array<{ id: number; cartQuantity: number }> = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ valid: true, hasIssues: false, issues: [], updatedProducts: [] });
    }

    const itemIds = items.map((i) => Number(i.id)).filter((id) => !isNaN(id) && id > 0);

    if (itemIds.length === 0) {
      return NextResponse.json({ valid: true, hasIssues: false, issues: [], updatedProducts: [] });
    }

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: itemIds } },
      select: {
        id: true,
        name: true,
        stock: true,
        active: true,
        price: true,
        unitType: true,
        packSize: true,
        quantity: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const issues: Array<{
      id: number;
      name: string;
      cartQuantity: number;
      availableStock: number;
      unitType: string;
      issueType: "OUT_OF_STOCK" | "EXCEEDS_STOCK" | "UNAVAILABLE";
      message: string;
    }> = [];

    const updatedProducts: Array<{ id: number; stock: number; price: number; active: boolean }> = [];

    for (const item of items) {
      const dbProd = productMap.get(Number(item.id));
      const requestedQty = Number(item.cartQuantity) || 1;

      if (!dbProd || !dbProd.active) {
        issues.push({
          id: item.id,
          name: dbProd?.name || `Product #${item.id}`,
          cartQuantity: requestedQty,
          availableStock: 0,
          unitType: dbProd?.unitType || "BOX",
          issueType: "UNAVAILABLE",
          message: `Product "${dbProd?.name || `Product #${item.id}`}" is currently unavailable.`,
        });
        updatedProducts.push({ id: item.id, stock: 0, price: 0, active: false });
        continue;
      }

      updatedProducts.push({
        id: dbProd.id,
        stock: dbProd.stock,
        price: Number(dbProd.price),
        active: dbProd.active,
      });

      if (dbProd.stock <= 0) {
        issues.push({
          id: dbProd.id,
          name: dbProd.name,
          cartQuantity: requestedQty,
          availableStock: 0,
          unitType: dbProd.unitType || "BOX",
          issueType: "OUT_OF_STOCK",
          message: `Product "${dbProd.name}" is currently out of stock.`,
        });
      } else if (requestedQty > dbProd.stock) {
        const unit = (dbProd.unitType || "box").toLowerCase();
        const unitLabel = `${unit}${dbProd.stock === 1 ? "" : "es"}`;
        const isAre = dbProd.stock === 1 ? "is" : "are";
        issues.push({
          id: dbProd.id,
          name: dbProd.name,
          cartQuantity: requestedQty,
          availableStock: dbProd.stock,
          unitType: dbProd.unitType || "BOX",
          issueType: "EXCEEDS_STOCK",
          message: `Sorry, only ${dbProd.stock} ${unitLabel} of "${dbProd.name}" ${isAre} currently available in stock.`,
        });
      }
    }

    return NextResponse.json({
      valid: issues.length === 0,
      hasIssues: issues.length > 0,
      issues,
      updatedProducts,
    });
  } catch (error) {
    console.error("Failed to validate cart stock:", error);
    return NextResponse.json({ error: "Failed to validate cart stock" }, { status: 500 });
  }
}
