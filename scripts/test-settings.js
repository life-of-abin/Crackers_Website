import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Testing prisma.settings.upsert()...");
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      storeName: "Sri Sivakasi Crackers",
      phone: "9629525907",
      email: "abinesh.ece2003@gmail.com",
    },
    create: {
      id: 1,
      storeName: "Sri Sivakasi Crackers",
      phone: "9629525907",
      email: "abinesh.ece2003@gmail.com",
      address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
      googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
      whatsappNumber: "+919629525907",
      minOrderAmount: 500,
      flatShippingFee: 100,
      freeShippingThreshold: 3000,
    },
  });

  console.log("✓ SUCCESS! Settings upsert completed cleanly:", settings);
  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
