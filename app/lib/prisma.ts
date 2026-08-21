import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL environment variable is missing! Database queries will fail until DATABASE_URL is set in environment settings.");
  }

  const pool = new pg.Pool({
    connectionString: connectionString || "",
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 10000, // Evict idle connections after 10s to prevent stale closed sockets
    connectionTimeoutMillis: 10000,
    keepAlive: true,
  });

  pool.on("error", (err) => {
    // Ignore transient pool disconnection warnings; pool will establish fresh connections on demand
    if (process.env.NODE_ENV !== "production") {
      console.warn("PostgreSQL connection pool notice:", err.message);
    }
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
