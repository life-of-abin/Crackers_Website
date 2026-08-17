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

const targetCategories = [
  { name: "Atom Bombs", slug: "atom-bombs", sortOrder: 1, image: "/categories/Atom Bomb Icon.png" },
  { name: "Rockets", slug: "rockets", sortOrder: 2, image: "/categories/Rocket Icon.png" },
  { name: "Chorsa Garland", slug: "chorsa-garland", sortOrder: 3, image: "/categories/Chorsa Garland Icon.png" },
  { name: "Gift Boxes", slug: "gift-boxes", sortOrder: 4, image: "/categories/Gift Boxes Icon.png" },
  { name: "Sound Crackers", slug: "sound-crackers", sortOrder: 5, image: "/categories/Sound Crackers Icon.png" },
  { name: "Aerial Shots", slug: "aerial-shots", sortOrder: 6, image: "/categories/Aerial Shots Icon.png" },
  { name: "Ground Chakkras", slug: "ground-chakkras", sortOrder: 7, image: "/categories/Ground Chakkars Icon.png" },
  { name: "Flower Pots", slug: "flower-pots", sortOrder: 8, image: "/categories/Flower Pots Icon.png" },
  { name: "Sparkles", slug: "sparkles", sortOrder: 9, image: "/categories/Sparkles Icon.png" },
  { name: "Kids Fun Crackers", slug: "kids-fun-crackers", sortOrder: 10, image: "/categories/Kids Fun Crackers Icon.png" },
  { name: "Newly Launched", slug: "newly-launched", sortOrder: 11, image: "/categories/Default Product Image.png" },
];

async function main() {
  console.log("🧹 Finalizing Category Cleanup & Population...");

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const validNames = targetCategories.map((t) => t.name);

    // Delete any old categories not in the 11 list that have 0 products
    const obsoleteCats = await prisma.category.findMany({
      where: { name: { notIn: validNames } },
      include: { _count: { select: { products: true } } },
    });

    for (const obs of obsoleteCats) {
      if (obs._count.products === 0) {
        await prisma.category.delete({ where: { id: obs.id } });
        console.log(`🗑️ Deleted obsolete empty category: "${obs.name}" (ID: ${obs.id})`);
      }
    }

    // Populate Aerial Shots if 0 products
    const aerialCat = await prisma.category.findUnique({ where: { name: "Aerial Shots" } });
    if (aerialCat) {
      const count = await prisma.product.count({ where: { categoryId: aerialCat.id } });
      if (count === 0) {
        await prisma.product.createMany({
          data: [
            {
              name: "7 Color Fancy Sky Shot (12 Pcs)",
              slug: "7-color-fancy-sky-shot-12-pcs",
              description: "High aerial multi-color bursts with crackling stars",
              categoryId: aerialCat.id,
              price: 450.0,
              mrp: 900.0,
              discount: "50% OFF",
              quantity: "12 Shots",
              unitType: "BOX",
              packSize: "12 Shots",
              stock: 50,
              featured: true,
              badge: "Bestseller",
            },
            {
              name: "12 Shell Night Display Aerial Shot",
              slug: "12-shell-night-display-aerial-shot",
              description: "Grand festival aerial fireworks with golden palm trees",
              categoryId: aerialCat.id,
              price: 850.0,
              mrp: 1700.0,
              discount: "50% OFF",
              quantity: "12 Shells",
              unitType: "BOX",
              packSize: "12 Shells",
              stock: 40,
              featured: true,
            },
          ],
        });
        console.log(`🎆 Created demo products for "Aerial Shots"`);
      }
    }

    // Populate Newly Launched if 0 products
    const newlyCat = await prisma.category.findUnique({ where: { name: "Newly Launched" } });
    if (newlyCat) {
      const count = await prisma.product.count({ where: { categoryId: newlyCat.id } });
      if (count === 0) {
        await prisma.product.createMany({
          data: [
            {
              name: "2026 Edition Multi-Color Whistling Fountain",
              slug: "2026-edition-multi-color-whistling-fountain",
              description: "Newly launched 2026 festival special color fountain",
              categoryId: newlyCat.id,
              price: 320.0,
              mrp: 640.0,
              discount: "50% OFF",
              quantity: "5 Pcs",
              unitType: "BOX",
              packSize: "5 Pcs",
              stock: 30,
              badge: "NEW",
            },
            {
              name: "Deluxe Spinning Saturn Wheel 2026",
              slug: "deluxe-spinning-saturn-wheel-2026",
              description: "High speed double stage spinning wheel with bright sparks",
              categoryId: newlyCat.id,
              price: 280.0,
              mrp: 560.0,
              discount: "50% OFF",
              quantity: "2 Pcs",
              unitType: "BOX",
              packSize: "2 Pcs",
              stock: 25,
              badge: "NEW",
            },
          ],
        });
        console.log(`✨ Created demo products for "Newly Launched"`);
      }
    }

    // Update sortOrder for all 11 categories
    for (const cat of targetCategories) {
      await prisma.category.update({
        where: { name: cat.name },
        data: { sortOrder: cat.sortOrder, image: cat.image },
      });
    }

    // Final list
    const finalCategories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    });

    console.log("\n=======================================================");
    console.log("🎉 FINAL DATABASE STATE (EXACTLY 11 CATEGORIES IN SORT ORDER)");
    console.log("=======================================================");
    for (const c of finalCategories) {
      console.log(
        `[SortOrder: ${c.sortOrder}] Name: "${c.name}" | Slug: "${c.slug}" | Image: "${c.image}" | Products: ${c._count.products}`
      );
    }
    console.log("=======================================================\n");
  } catch (err) {
    console.error("Error in cleanup:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
