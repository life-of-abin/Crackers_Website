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
  
  const res = await client.query('SELECT id, name, "categoryId" FROM "Product"');
  console.log(`Total products: ${res.rows.length}`);
  
  const unassigned = res.rows.filter(p => p.categoryId === null);
  console.log(`Unassigned products: ${unassigned.length}`);
  
  if (unassigned.length > 0) {
    console.log('Sample of unassigned products:');
    unassigned.forEach(p => {
      console.log(`- [${p.id}] ${p.name}`);
    });
  }
  
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
