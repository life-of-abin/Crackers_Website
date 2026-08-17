import fs from "fs";
import path from "path";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const envPath = path.join(__dirname, "../.env");
const envFile = fs.readFileSync(envPath, "utf-8");
let databaseUrl = "";
for (const line of envFile.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    databaseUrl = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log("=== EXISTING DATABASE CATEGORIES ===");
  for (const c of categories) {
    console.log(`[ID: ${c.id}] Name: "${c.name}", Slug: "${c.slug}", Image: "${c.image}", Product Count: ${c._count.products}`);
  }

  const totalProducts = await prisma.product.count();
  console.log(`\nTOTAL PRODUCTS IN DB: ${totalProducts}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
