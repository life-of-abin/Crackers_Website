import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const client = new Client({ connectionString });

async function main() {
  await client.connect();
  
  console.log('Deleting categories with ID > 50 to keep only the original 11 categories...');
  
  // This will set the categoryId to NULL for any associated products, 
  // keeping the products safe as per the Prisma schema onDelete: SetNull rule.
  const res = await client.query('DELETE FROM "Category" WHERE id > 50');
  
  console.log(`Successfully deleted ${res.rowCount} duplicated categories.`);
  
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
