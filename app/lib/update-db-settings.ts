import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

export async function updateStoreSettings() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  const updated = await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      phone: "9629525907",
      email: "abinesh.ece200@gmail.com",
      whatsappNumber: "+919629525907",
    },
    create: {
      id: 1,
      storeName: "Sri Sivakasi Crackers",
      phone: "9629525907",
      email: "abinesh.ece200@gmail.com",
      address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
      googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
      whatsappNumber: "+919629525907",
      minOrderAmount: 500,
      flatShippingFee: 100,
      freeShippingThreshold: 3000,
    },
  });

  console.log("SUCCESS! Store Settings updated in PostgreSQL DB:", updated);
  await prisma.$disconnect();
}

updateStoreSettings().catch((err) => {
  console.error("Error updating settings in DB:", err);
  process.exit(1);
});
