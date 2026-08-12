import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function updateStoreSettings() {
  console.log("Updating PostgreSQL store settings table (id=1)...");
  
  const connectionString = process.env.DATABASE_URL || "";
  console.log("DATABASE_URL present:", !!connectionString);

  const adapter = new PrismaPg({ connectionString });
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
