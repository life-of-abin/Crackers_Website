import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  let connectionString =
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://"))
      ? process.env.DATABASE_URL
      : "postgres://localhost:5432/postgres";

  if (connectionString.includes("sslmode=require") && !connectionString.includes("uselibpqcompat=")) {
    connectionString = connectionString.includes("?")
      ? `${connectionString}&uselibpqcompat=true`
      : `${connectionString}?uselibpqcompat=true`;
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
