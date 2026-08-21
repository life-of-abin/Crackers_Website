import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

function getCategoryId(name: string): number {
  const lower = name.toLowerCase();

  // 1. Gift Boxes (ID: 43)
  if (
    lower.includes('gift') ||
    lower.includes('khushi') ||
    lower.includes('diamond') ||
    lower.includes('titan') ||
    lower.includes('paradise')
  ) {
    return 43;
  }

  // 2. Rockets (ID: 2)
  if (lower.includes('rocket')) {
    return 2;
  }

  // 3. Flower Pots (ID: 5)
  if (
    lower.includes('flower') ||
    lower.includes('fountain') ||
    lower.includes('pot')
  ) {
    return 5;
  }

  // 4. Atom Bombs (ID: 40)
  if (
    lower.includes('bomb') ||
    lower.includes('atom') ||
    lower.includes('hydrogen') ||
    lower.includes('thunder')
  ) {
    return 40;
  }

  // 5. Chorsa Garland (ID: 11)
  if (
    lower.includes('garland') ||
    lower.includes('chorsa') ||
    lower.includes('wala') ||
    lower.includes('1000 mm') ||
    lower.includes('2000') ||
    lower.includes('5000')
  ) {
    return 11;
  }

  // 6. Aerial Shots (ID: 45)
  if (
    lower.includes('shot') ||
    lower.includes('aerial') ||
    lower.includes('sky') ||
    lower.includes('pipe') ||
    lower.includes('robin') ||
    lower.includes('10 in 1') ||
    lower.includes('5 star')
  ) {
    return 45;
  }

  // 7. Ground Chakkras (ID: 46)
  if (
    lower.includes('chakkar') ||
    lower.includes('chakras') ||
    lower.includes('chakkras') ||
    lower.includes('chakkars') ||
    lower.includes('spin') ||
    lower.includes('spinner') ||
    lower.includes('twister') ||
    lower.includes('wheel') ||
    lower.includes('sing-n-dance') ||
    lower.includes('zamin')
  ) {
    return 46;
  }

  // 8. Sparkles (ID: 48)
  if (
    lower.includes('sparkle') ||
    lower.includes('sparkler') ||
    lower.includes('sparkles') ||
    lower.includes('sparklers') ||
    lower.includes('silver drops') ||
    lower.includes('lemon tree') ||
    lower.includes('maya jaal') ||
    lower.includes('bonanza') ||
    lower.includes('mix trix') ||
    lower.includes('millenium mix') ||
    (lower.includes('cm') && !lower.includes('twinkling'))
  ) {
    return 48;
  }

  // 9. Kids Fun Crackers (ID: 49)
  if (
    lower.includes('gun') ||
    lower.includes('caps') ||
    lower.includes('cap') ||
    lower.includes('roll') ||
    lower.includes('ring') ||
    lower.includes('torch') ||
    lower.includes('candle') ||
    lower.includes('stick') ||
    lower.includes('pencil') ||
    lower.includes('twinkling') ||
    lower.includes('twinklings') ||
    lower.includes('star') ||
    lower.includes('pop') ||
    lower.includes('snake')
  ) {
    return 49;
  }

  // 10. Sound Crackers (ID: 44)
  if (
    lower.includes('bijili') ||
    lower.includes('sparrow') ||
    lower.includes('laxmi') ||
    lower.includes('hercules') ||
    lower.includes('bahubali') ||
    lower.includes('sound') ||
    lower.includes('cracker') ||
    lower.includes('burst') ||
    lower.includes('warrior') ||
    lower.includes('watts') ||
    lower.includes('giant')
  ) {
    return 44;
  }

  // 11. Newly Launched (ID: 50) as default fallback
  return 50;
}

async function runWithRetry(attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      const res = await client.query('SELECT id, name, "categoryId" FROM "Product"');
      console.log(`Analyzing ${res.rows.length} products...`);

      const categoryCounts: Record<number, number> = {};
      const catNames: Record<number, string> = {
        2: 'Rockets',
        5: 'Flower Pots',
        11: 'Chorsa Garland',
        40: 'Atom Bombs',
        43: 'Gift Boxes',
        44: 'Sound Crackers',
        45: 'Aerial Shots',
        46: 'Ground Chakkras',
        48: 'Sparkles',
        49: 'Kids Fun Crackers',
        50: 'Newly Launched'
      };

      for (const product of res.rows) {
        const catId = getCategoryId(product.name);
        categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
      }

      console.log('Category Counts after proposed mapping:');
      for (const [id, count] of Object.entries(categoryCounts)) {
        console.log(`- ID ${id} (${catNames[Number(id)] || 'Unknown'}): ${count} products`);
      }

      await client.end();
      return;
    } catch (e) {
      console.error(`Attempt ${i + 1} failed:`, e);
      try { await client.end(); } catch (_) {}
      if (i === attempts - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

runWithRetry().catch(console.error);
