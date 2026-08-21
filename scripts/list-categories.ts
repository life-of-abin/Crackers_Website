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
  const res = await client.query('SELECT id, name, slug FROM "Category" ORDER BY id ASC');
  console.log(`Found ${res.rows.length} categories:`);
  for (const row of res.rows) {
    console.log(`- ID: ${row.id} | Name: ${row.name} | Slug: ${row.slug}`);
  }
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
