import dotenv from "dotenv";
dotenv.config();

import pg from "pg";

async function main() {
  console.log("Connecting to PostgreSQL to run non-destructive ALTER TABLE column additions...");

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const client = await pool.connect();

  try {
    console.log("Adding missing columns to Settings table if not present...");
    await client.query(`
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "gstin" TEXT;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "legalName" TEXT;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "invoiceTerms" TEXT;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "isGstRegistered" BOOLEAN DEFAULT false;
      ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "signatureImage" TEXT;
    `);
    console.log("✓ Settings table schema synchronized!");

    console.log("Adding missing columns to Order table if not present...");
    await client.query(`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
    `);
    console.log("✓ Order table schema synchronized!");

  } catch (err) {
    console.error("Error executing ALTER TABLE statements:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
