import fs from "fs";
import path from "path";
import pg from "pg";

const envPath = path.join(__dirname, "../.env");
const envFile = fs.readFileSync(envPath, "utf-8");
let databaseUrl = "";
for (const line of envFile.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    databaseUrl = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  console.log("🛠️ Adding sortOrder column to Category table via direct SQL...");
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;');
    await pool.query('ALTER TABLE "Product" ALTER COLUMN "categoryId" DROP NOT NULL;');
    console.log("✅ SQL ALTER statements executed successfully!");
  } catch (err) {
    console.error("❌ SQL execution failed:", err);
  } finally {
    await pool.end();
  }
}

main();
