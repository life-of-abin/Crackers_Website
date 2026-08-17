import fs from "fs";
import path from "path";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Read DATABASE_URL from .env file
const envPath = path.join(__dirname, "../.env");
const envFile = fs.readFileSync(envPath, "utf-8");
let databaseUrl = "";
for (const line of envFile.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    databaseUrl = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  console.log("🌱 Connecting to PostgreSQL Database...");
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const updated = await prisma.category.updateMany({
      where: { name: { contains: "Atom Bomb", mode: "insensitive" } },
      data: { image: "/categories/atom-bomb.png" },
    });

    console.log("✅ Updated categories count:", updated.count);

    const atomBomb = await prisma.category.findFirst({
      where: { name: { contains: "Atom Bomb", mode: "insensitive" } },
    });

    console.log("✅ Atom Bomb Category Record in Database:", atomBomb);
  } catch (err) {
    console.error("❌ Failed to update Atom Bomb category:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
