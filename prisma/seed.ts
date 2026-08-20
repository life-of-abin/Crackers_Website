import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Sparklers", sortOrder: 1, image: "/categories/Sparkles Icon.png" },
  { name: "Atom Bomb", sortOrder: 2, image: "/categories/Atom Bomb Icon.png" },
  { name: "Rockets", sortOrder: 3, image: "/categories/Rocket Icon.png" },
  { name: "Chorsa Garland", sortOrder: 4, image: "/categories/Chorsa Garland Icon.png" },
  { name: "Gift Items", sortOrder: 5, image: "/categories/Gift Boxes Icon.png" },
  { name: "Chakkars", sortOrder: 6, image: "/categories/Ground Chakkars Icon.png" },
  { name: "Flower Pots", sortOrder: 7, image: "/categories/Flower Pots Icon.png" },
  { name: "Twinkling Star", sortOrder: 8, image: "/categories/Sparkles Icon.png" },
  { name: "Pencil", sortOrder: 9, image: "/categories/Kids Fun Crackers Icon.png" },
  { name: "Single / Two Sound Crackers", sortOrder: 10, image: "/categories/Sound Crackers Icon.png" },
  { name: "Electric Crackers", sortOrder: 11, image: "/categories/Sound Crackers Icon.png" },
  { name: "Aerial Shots", sortOrder: 12, image: "/categories/Aerial Shots Icon.png" },
  { name: "Kids Fun Crackers", sortOrder: 13, image: "/categories/Kids Fun Crackers Icon.png" },
  { name: "Newly Launched", sortOrder: 14, image: "/categories/Default Product Image.png" },
];
const products = [
  // ============================================================
  // SPARKLERS
  // ============================================================

  {
    name: "7cm Electric sparklers B (10 Pcs)",
    category: "Sparklers",
    price: 7.0,
    mrp: 35.0,
  },
  {
    name: "7cm Crackling Sparklers B (10 Pcs)",
    category: "Sparklers",
    price: 8.0,
    mrp: 40.0,
  },
  {
    name: "10 cm Electric E (EXPORT QUALITY) (10 Pcs)",
    category: "Sparklers",
    price: 29.86,
    mrp: 149.33,
  },
  {
    name: "10 cm Cracking E (EXPORT QUALITY) (10 Pcs)",
    category: "Sparklers",
    price: 32.12,
    mrp: 160.59,
  },
  {
    name: "15cm Electric Sparklers B (10Pcs)",
    category: "Sparklers",
    price: 35.0,
    mrp: 175.0,
  },
  {
    name: "15cm Crackling Sparklers B (10Pcs)",
    category: "Sparklers",
    price: 40.0,
    mrp: 200.0,
  },
  {
    name: "30cm Electric Sparklers B (5Pcs)",
    category: "Sparklers",
    price: 52.19,
    mrp: 260.97,
  },
  {
    name: "30cm Crackling Sparklers B (5Pcs)",
    category: "Sparklers",
    price: 57.83,
    mrp: 289.19,
  },
  {
    name: "12 cm Twin Tone E (EXPORT QUALITY) (10 Pcs)",
    category: "Sparklers",
    price: 62.06,
    mrp: 310.3,
  },
  {
    name: "12 cm Silver Drops E (EXPORT QUALITY) (10 Pcs)",
    category: "Sparklers",
    price: 65.94,
    mrp: 329.7,
  },
  {
    name: "20 CM EXPORT GOLD SPARKLERS (10 PCS)",
    category: "Sparklers",
    price: 70.62,
    mrp: 353.1,
  },
  {
    name: "15Cm Lemon Tree sparklers (10 pcs)",
    category: "Sparklers",
    price: 70.94,
    mrp: 354.71,
  },
  {
    name: "15 cm Electric E (EXPORT QUALITY) (10 Pcs)",
    category: "Sparklers",
    price: 82.23,
    mrp: 411.15,
  },
  {
    name: "30 cm Electric E (Export Quality)(5 Pcs)",
    category: "Sparklers",
    price: 82.23,
    mrp: 411.15,
  },
  {
    name: "15Cm gold sparklers (10 pcs)",
    category: "Sparklers",
    price: 84.1,
    mrp: 420.51,
  },
  {
    name: "30 Cm gold sparklers (5 pcs)",
    category: "Sparklers",
    price: 84.1,
    mrp: 420.51,
  },
  {
    name: "15 cm Crackling E (EXPORT QUALITY) (10 Pcs)",
    category: "Sparklers",
    price: 88.44,
    mrp: 442.18,
  },
  {
    name: "30 cm crackling E (Export Quality) (5 Pcs)",
    category: "Sparklers",
    price: 88.44,
    mrp: 442.18,
  },
  {
    name: "20 CM EXPORT CRACKLING SPARKLERS (10 PCS)",
    category: "Sparklers",
    price: 88.92,
    mrp: 444.59,
  },
  {
    name: "30 cm Grandeur Green E (Export Quality)(5 Pcs)",
    category: "Sparklers",
    price: 93.53,
    mrp: 500.36,
  },
  {
    name: "15Cm Crackling Sparklers S (10 Pcs)",
    category: "Sparklers",
    price: 94.21,
    mrp: 471.07,
  },
  {
    name: "30 Cm crackling sparklers S (5 pcs)",
    category: "Sparklers",
    price: 94.21,
    mrp: 471.07,
  },
  {
    name: "30cm Wala Sound Sparkles E (5 Pcs)",
    category: "Sparklers",
    price: 98.0,
    mrp: 490.0,
  },
  {
    name: "30 cm Millenium Mix E (Export Quality) (5 Pcs)",
    category: "Sparklers",
    price: 100.05,
    mrp: 535.27,
  },
  {
    name: "15 cm Maya Jaal E (EXPORT QUALITY) (10 Pcs)",
    category: "Sparklers",
    price: 113.26,
    mrp: 566.3,
  },
  {
    name: "50Cm electric sparklers B (5 pcs)",
    category: "Sparklers",
    price: 203.14,
    mrp: 1015.7,
  },
  {
    name: "50 Cm Colour sparklers B (5 pcs)",
    category: "Sparklers",
    price: 208.78,
    mrp: 1043.91,
  },
  {
    name: "50 cm Electric E (Export Quality) (5 Pcs)",
    category: "Sparklers",
    price: 217.5,
    mrp: 1163.63,
  },
  {
    name: "50 cm Mix Trix E (Export Quality) (5 Pcs)",
    category: "Sparklers",
    price: 246.5,
    mrp: 1318.78,
  },
  {
    name: "Rotating Sparklers E (1 Pcs) (German Technics)",
    category: "Sparklers",
    price: 246.5,
    mrp: 1318.78,
  },
  {
    name: "15 cm Bouquet Bonanza E (50 pcs pack)",
    category: "Sparklers",
    price: 581.81,
    mrp: 2909.06,
  },

  // ============================================================
  // ROCKETS
  // ============================================================

  {
    name: "Surveyor rockets (10 pcs)",
    category: "Rockets",
    price: 96.46,
    mrp: 482.3,
  },
  {
    name: "Musical Rocket B (5 Pcs)",
    category: "Rockets",
    price: 160.5,
    mrp: 802.5,
  },
  {
    name: "Bomb rockets (10 pcs)",
    category: "Rockets",
    price: 175.43,
    mrp: 877.13,
  },
  {
    name: "THREE SOUND ROCKET E (10 Pcs)",
    category: "Rockets",
    price: 190.18,
    mrp: 950.93,
  },
  {
    name: "Crackling Rocket E (10 Pcs)",
    category: "Rockets",
    price: 204.95,
    mrp: 1024.76,
  },
  {
    name: "Rohini rockets (10 pcs)",
    category: "Rockets",
    price: 277.83,
    mrp: 1389.13,
  },
  {
    name: "WHISTLING SYMPHONY ROCKET E (10 PCS)",
    category: "Rockets",
    price: 325.69,
    mrp: 1628.43,
  },
  {
    name: "Mark 1 Crackling Rocket E (10 Pcs)",
    category: "Rockets",
    price: 651.63,
    mrp: 3258.15,
  },
  {
    name: "Parachute rockets (5 pcs)",
    category: "Rockets",
    price: 704.76,
    mrp: 3523.78,
  },

  // ============================================================
  // GIFT ITEMS
  // ============================================================

  {
    name: "Khushi gift box (42 Items)",
    category: "Gift Items",
    price: 1707.72,
    mrp: 8538.6,
  },
  {
    name: "Diamond (50 items)",
    category: "Gift Items",
    price: 2129.84,
    mrp: 10649.18,
  },
  {
    name: "TITAN (55 ITEMS)",
    category: "Gift Items",
    price: 2523.06,
    mrp: 12615.3,
  },
  {
    name: "NEW PARADISE (FANCY / AERIAL COLLECTIONS) (27 ITEMS)",
    category: "Gift Items",
    price: 4546.97,
    mrp: 22734.83,
  },

  // ============================================================
  // CHAKKARS
  // ============================================================

  {
    name: "Zamin chakkar big (10 pcs)",
    category: "Chakkars",
    price: 64.52,
    mrp: 322.61,
  },
  {
    name: "Ground Chakkar Asoka B (10 pcs)",
    category: "Chakkars",
    price: 92.4,
    mrp: 494.34,
  },
  {
    name: "zamin chakkar asoka (10 pcs)",
    category: "Chakkars",
    price: 107.54,
    mrp: 537.68,
  },
  {
    name: "Twin spin (5 Pcs)",
    category: "Chakkars",
    price: 114.6,
    mrp: 572.99,
  },
  {
    name: "Ground Chakkar Deluxe B (10 Pcs)",
    category: "Chakkars",
    price: 148.3,
    mrp: 741.51,
  },
  {
    name: "Ground chakkar Asoka E (10 pcs)",
    category: "Chakkars",
    price: 162.91,
    mrp: 814.54,
  },
  {
    name: "Mega Twister (5 Pcs)",
    category: "Chakkars",
    price: 167.4,
    mrp: 837.01,
  },
  {
    name: "whizz wheel (Whistling Sounds)",
    category: "Chakkars",
    price: 170.45,
    mrp: 852.26,
  },
  {
    name: "Whizz Chakkar B (2 Pcs)",
    category: "Chakkars",
    price: 176.55,
    mrp: 882.75,
  },
  {
    name: "Spinner special E (10 Pcs)",
    category: "Chakkars",
    price: 235.94,
    mrp: 1179.68,
  },
  {
    name: "zamin chakkar delux (10 pcs)",
    category: "Chakkars",
    price: 236.74,
    mrp: 1183.69,
  },
  {
    name: "Wire Chakkar E (10 pcs)",
    category: "Chakkars",
    price: 244.92,
    mrp: 1224.62,
  },
  {
    name: "SPINNER DELUXE E (10 PCS)",
    category: "Chakkars",
    price: 269.64,
    mrp: 1348.2,
  },
  {
    name: "SING-N-DANCE E (5 PCS)",
    category: "Chakkars",
    price: 276.49,
    mrp: 1382.44,
  },
  {
    name: "Spinner super deluxe E (10 Pcs)",
    category: "Chakkars",
    price: 303.35,
    mrp: 1516.73,
  },

  // ============================================================
  // FLOWER POTS
  // ============================================================

  {
    name: "Flower Pots Big B (10Pcs)",
    category: "Flower Pots",
    price: 112.35,
    mrp: 561.75,
  },
  {
    name: "Flower Pots Special B (10 pcs)",
    category: "Flower Pots",
    price: 144.93,
    mrp: 724.66,
  },
  {
    name: "Flower pots big S (10 pcs)",
    category: "Flower Pots",
    price: 164.51,
    mrp: 822.56,
  },
  {
    name: "Colour Koti B (MultI Colour) (10 pcs)",
    category: "Flower Pots",
    price: 180.0,
    mrp: 900.0,
  },
  {
    name: "Flower Pots Asoka B (10Pcs)",
    category: "Flower Pots",
    price: 210.58,
    mrp: 1052.88,
  },
  {
    name: "Flower pots special S (10 pcs)",
    category: "Flower Pots",
    price: 218.92,
    mrp: 1094.61,
  },
  {
    name: "CHEERS (3 PCS)",
    category: "Flower Pots",
    price: 233.53,
    mrp: 1167.64,
  },
  {
    name: "Flower Pots Asoka E (10Pcs)",
    category: "Flower Pots",
    price: 261.78,
    mrp: 1308.88,
  },
  {
    name: "Flower pots deluxe S (5 pcs)",
    category: "Flower Pots",
    price: 294.84,
    mrp: 1474.19,
  },
  {
    name: "SUN DROPS (5 PCS)",
    category: "Flower Pots",
    price: 330.95,
    mrp: 1654.76,
  },
  {
    name: "Colour Koti Premium E (10 pcs)",
    category: "Flower Pots",
    price: 402.21,
    mrp: 2011.07,
  },
  {
    name: "Flower pots giant S (10 pcs)",
    category: "Flower Pots",
    price: 453.89,
    mrp: 2269.47,
  },
  {
    name: "Tri colour fountains (millennium) (5 pcs)",
    category: "Flower Pots",
    price: 539.92,
    mrp: 2699.61,
  },
  {
    name: "Colour world (10 pcs)",
    category: "Flower Pots",
    price: 546.5,
    mrp: 2732.51,
  },
  {
    name: "DON WORLD E (10 PCS)",
    category: "Flower Pots",
    price: 786.45,
    mrp: 3932.25,
  },
  {
    name: "SABSE BADA KOTI E (10 Pcs)",
    category: "Flower Pots",
    price: 834.28,
    mrp: 4171.4,
  },

  // ============================================================
  // TWINKLING STAR
  // ============================================================

  {
    name: "45 cm Silver twinkling star B (10 pcs)",
    category: "Twinkling Star",
    price: 39.48,
    mrp: 197.42,
  },
  {
    name: "Silver twinklings S (60 cm - 2') (10 pcs)",
    category: "Twinkling Star",
    price: 89.56,
    mrp: 447.8,
  },
  {
    name: "120 cm Deluxe Twinkling star B (10 pcs)",
    category: "Twinkling Star",
    price: 105.29,
    mrp: 526.44,
  },
  {
    name: "Silver twinklings deluxe S (120cm -4 inch) (10 pcs)",
    category: "Twinkling Star",
    price: 188.11,
    mrp: 940.53,
  },

  // ============================================================
  // PENCIL
  // ============================================================

  {
    name: "Magnetic torches (10 pcs)",
    category: "Pencil",
    price: 78.48,
    mrp: 392.42,
  },
  {
    name: "multi colour candles (10 pcs)",
    category: "Pencil",
    price: 120.54,
    mrp: 602.68,
  },

  // ============================================================
  // SINGLE / TWO SOUND CRACKERS
  // ============================================================

  {
    name: '2 3/4" Sparrow Crackers (5 Pcs)',
    category: "Single / Two Sound Crackers",
    price: 17.49,
    mrp: 87.47,
  },
  {
    name: '3 1/2 inch Laxmi crackers (5 pcs)',
    category: "Single / Two Sound Crackers",
    price: 28.89,
    mrp: 144.45,
  },
  {
    name: "2 sound crackers (5 pcs)",
    category: "Single / Two Sound Crackers",
    price: 43.5,
    mrp: 217.48,
  },
  {
    name: "4 inch HERCULES DELUXE S (5 pcs)",
    category: "Single / Two Sound Crackers",
    price: 52.97,
    mrp: 264.83,
  },
  {
    name: "5 INCH BAHUBALI (16 Ply) B (5 pcs)",
    category: "Single / Two Sound Crackers",
    price: 56.18,
    mrp: 280.88,
  },
  {
    name: "GIANT BIJILI (50 PCS)",
    category: "Single / Two Sound Crackers",
    price: 68.37,
    mrp: 341.87,
  },

  // ============================================================
  // ATOM BOMB
  // ============================================================

  {
    name: "Atom Bomb Big Green B (10 pcs)",
    category: "Atom Bomb",
    price: 80.25,
    mrp: 401.25,
  },
  {
    name: "HYDROGEN BOMB E (10 Pcs)",
    category: "Atom Bomb",
    price: 93.61,
    mrp: 468.08,
  },
  {
    name: "Hydrogen bomb green (10 pcs)",
    category: "Atom Bomb",
    price: 112.35,
    mrp: 561.75,
  },
  {
    name: "555 BOMB FOILS (6 PCS)",
    category: "Atom Bomb",
    price: 142.31,
    mrp: 711.55,
  },
  {
    name: "Classic Bomb Green B (10 pcs)",
    category: "Atom Bomb",
    price: 149.27,
    mrp: 746.33,
  },
  {
    name: "Flower bomb (ganga jamuna) (5 pcs)",
    category: "Atom Bomb",
    price: 157.29,
    mrp: 786.45,
  },
  {
    name: "Thunder bomb green (10 pcs)",
    category: "Atom Bomb",
    price: 158.09,
    mrp: 790.46,
  },
  {
    name: "MEGA CLASSIC BOMB E (10 Pcs)",
    category: "Atom Bomb",
    price: 162.43,
    mrp: 812.13,
  },
  {
    name: "Colour burst (10 pcs)",
    category: "Atom Bomb",
    price: 173.82,
    mrp: 869.11,
  },
  {
    name: "Boom bomb (10 pieces)",
    category: "Atom Bomb",
    price: 212.34,
    mrp: 1061.71,
  },
  {
    name: "555 Timing Bomb E (10 Pcs)",
    category: "Atom Bomb",
    price: 218.54,
    mrp: 1092.68,
  },

  // ============================================================
  // ELECTRIC CRACKERS
  // ============================================================

  {
    name: "28 Chorsa Crackers B (1Pkt)",
    category: "Electric Crackers",
    price: 19.1,
    mrp: 95.5,
  },
  {
    name: "28 Giant Crackers B (1 Pkt)",
    category: "Electric Crackers",
    price: 30.33,
    mrp: 151.67,
  },
  {
    name: "Red Bijili Crackers B (100Pcs)",
    category: "Electric Crackers",
    price: 56.18,
    mrp: 280.88,
  },
  {
    name: "STRIPPED BIJILI B (100 Pcs)",
    category: "Electric Crackers",
    price: 58.42,
    mrp: 292.11,
  },
  {
    name: "56 Giant Crackers B (1 Pkt)",
    category: "Electric Crackers",
    price: 60.67,
    mrp: 303.35,
  },
  {
    name: "24 X 250 Heman Deluxe B (1 Pkt)",
    category: "Electric Crackers",
    price: 66.29,
    mrp: 331.43,
  },
  {
    name: "Bijili crackers red S (100 pcs)",
    category: "Electric Crackers",
    price: 71.1,
    mrp: 355.51,
  },
  {
    name: "Knight Warriors E (50 Deluxe)",
    category: "Electric Crackers",
    price: 158.0,
    mrp: 789.98,
  },
  {
    name: "90 Watts B (3 pcs)",
    category: "Electric Crackers",
    price: 200.63,
    mrp: 1003.13,
  },
  {
    name: "1000 mm Crackers B Short Count (1 Pkt)",
    category: "Electric Crackers",
    price: 314.58,
    mrp: 1572.9,
  },

  // ============================================================
  // CHORSA GARLAND
  // ============================================================

  {
    name: "100 Crackers B Full Count",
    category: "Chorsa Garland",
    price: 64.04,
    mrp: 320.2,
  },
  {
    name: "100's mm fire crackers",
    category: "Chorsa Garland",
    price: 101.12,
    mrp: 506.65,
  },
  {
    name: "500 Giant wala Crackers E (New)",
    category: "Chorsa Garland",
    price: 256.93,
    mrp: 1284.64,
  },
  {
    name: "600 Crackers B Full Count",
    category: "Chorsa Garland",
    price: 381.99,
    mrp: 1909.95,
  },
  {
    name: "1000 Crackers B Full Count",
    category: "Chorsa Garland",
    price: 449.4,
    mrp: 2247.0,
  },
  {
    name: "1000's mm fire crackers S",
    category: "Chorsa Garland",
    price: 614.72,
    mrp: 3073.58,
  },
  {
    name: "1100 wala Giant Crackers E",
    category: "Chorsa Garland",
    price: 682.19,
    mrp: 3410.95,
  },
  {
    name: "2000 crackers B Full Count",
    category: "Chorsa Garland",
    price: 898.8,
    mrp: 4494.0,
  },
  {
    name: "2000's mm fire crackers S",
    category: "Chorsa Garland",
    price: 1173.26,
    mrp: 5866.28,
  },
  {
    name: "3300 wala Giant Crackers E (New)",
    category: "Chorsa Garland",
    price: 2046.57,
    mrp: 10232.84,
  },
  {
    name: "5000 Crackers B Full Count",
    category: "Chorsa Garland",
    price: 2247.0,
    mrp: 11235.0,
  },
  {
    name: "5000's mm fire crackers S",
    category: "Chorsa Garland",
    price: 2746.16,
    mrp: 13730.78,
  },
  {
    name: "5500 wala Giant Crackers E (New)",
    category: "Chorsa Garland",
    price: 3410.95,
    mrp: 17054.73,
  },
  {
    name: "10000 Crackers B Full Count",
    category: "Chorsa Garland",
    price: 4494.0,
    mrp: 22470.0,
  },
  {
    name: "10000's mm fire crackers S",
    category: "Chorsa Garland",
    price: 5479.47,
    mrp: 27397.35,
  },
  {
    name: "11000 wala Giant Crackers E (New)",
    category: "Chorsa Garland",
    price: 6821.89,
    mrp: 34109.46,
  },

  // ============================================================
  // MATCHES
  // ============================================================

  {
    name: "Robin Super Deluxe 10 in 1 Deluxe (10 Pcs)",
    category: "Matches",
    price: 79.53,
    mrp: 425.47,
  },
  {
    name: "Robin VIP 5 Star (5 Pcs)",
    category: "Matches",
    price: 122.43,
    mrp: 655.0,
  },

  // ============================================================
  // GUNS & ROLLS
  // ============================================================

  {
    name: "Lighting Stick (1 Pkt)",
    category: "Guns & Rolls",
    price: 10.0,
    mrp: 50.0,
  },
  {
    name: "Ring Caps B (9 shot)",
    category: "Guns & Rolls",
    price: 12.0,
    mrp: 60.0,
  },
  {
    name: "Roll Caps B",
    category: "Guns & Rolls",
    price: 59.92,
    mrp: 299.6,
  },
  {
    name: "Peacock roll caps",
    category: "Guns & Rolls",
    price: 94.7,
    mrp: 473.48,
  },
  {
    name: "CHALLENGER DELUXE GUN E (Roll Cap Gun)",
    category: "Guns & Rolls",
    price: 115.5,
    mrp: 577.5,
  },
  {
    name: "Air Marshal Gun E (Ring Cap Gun)",
    category: "Guns & Rolls",
    price: 126.0,
    mrp: 630.0,
  },
  {
    name: "LMG RIFLE GUN E (Roll Cap Gun)",
    category: "Guns & Rolls",
    price: 210.0,
    mrp: 1050.0,
  },
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function main() {
  console.log("🌱 Starting database seed...");

  // ------------------------------------------------------------
  // 0. Seed Default Settings & Admin User
  // ------------------------------------------------------------

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      storeName: "Sri Sivakasi Crackers",
      phone: "+91 98765 43210",
      email: "support@sivasakthicrackers.com",
      address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
      googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
      whatsappNumber: "+919876543210",
      minOrderAmount: 500,
      flatShippingFee: 100,
      freeShippingThreshold: 3000,
    },
    create: {
      id: 1,
      storeName: "Sri Sivakasi Crackers",
      phone: "+91 98765 43210",
      email: "support@sivasakthicrackers.com",
      address: "123 Main Bazaar, Sivakasi, Tamil Nadu 626123",
      googleMapsUrl: "https://maps.google.com/?q=Sivakasi,Tamil+Nadu",
      whatsappNumber: "+919876543210",
      minOrderAmount: 500,
      flatShippingFee: 100,
      freeShippingThreshold: 3000,
    },
  });

  // Admin credentials setup
  const adminEmail = process.env.ADMIN_EMAIL || "abinesh.ece2003@gmail.com";
  let adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminPasswordHash) {
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    // Dynamically generate PBKDF2 hash matching comparePassword in lib/auth.ts
    const crypto = require("crypto");
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(adminPassword, salt, 100000, 64, "sha512").toString("hex");
    adminPasswordHash = `pbkdf2:100000:${salt}:${hash}`;
  }

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      phone: "+919629525907",
    },
    create: {
      name: "Store Administrator",
      email: adminEmail,
      phone: "+919629525907",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log(`✅ Default settings and Admin user ready (${adminEmail})`);

  // ------------------------------------------------------------
  // 1. Create categories
  // ------------------------------------------------------------

  const categoryMap = new Map<string, number>();

  for (const cat of categories) {
    const slug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        slug,
        sortOrder: cat.sortOrder,
        image: cat.image,
        active: true,
      },
      create: {
        name: cat.name,
        slug,
        sortOrder: cat.sortOrder,
        image: cat.image,
        active: true,
      },
    });

    categoryMap.set(cat.name, category.id);
  }

  console.log(`✅ ${categories.length} categories ready`);

  // ------------------------------------------------------------
  // 2. Insert products
  // ------------------------------------------------------------

  let created = 0;
  const usedSlugs = new Set<string>();

  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    let categoryId = categoryMap.get(product.category);

    if (!categoryId) {
      const catSlug = slugify(product.category) || `cat-${index + 1}`;
      const newCat = await prisma.category.upsert({
        where: { name: product.category },
        update: { active: true },
        create: {
          name: product.category,
          slug: catSlug,
          sortOrder: categoryMap.size + 1,
          image: "/categories/Default Product Image.png",
          active: true,
        },
      });
      categoryId = newCat.id;
      categoryMap.set(product.category, categoryId);
    }

    let slug = slugify(product.name);
    if (!slug) slug = `product-${index + 1}`;
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${index + 1}`;
    }
    usedSlugs.add(slug);

    const discount = Math.round(
      ((product.mrp - product.price) / product.mrp) * 100,
    );

    // Feature some top products
    const featured = index % 8 === 0;
    const badge = (index % 5 === 0 || index % 7 === 0) ? "Bestseller" : null;

    await prisma.product.upsert({
      where: { slug },
      update: {
        name: product.name,
        categoryId,
        price: product.price,
        mrp: product.mrp,
        discount: `${discount}% OFF`,
        quantity: extractQuantity(product.name),
        active: true,
        featured,
        badge,
      },
      create: {
        name: product.name,
        slug,
        categoryId,
        price: product.price,
        mrp: product.mrp,
        discount: `${discount}% OFF`,
        quantity: extractQuantity(product.name),
        stock: 100,
        active: true,
        featured,
        badge,
        purchases: Math.floor(Math.random() * 50),
      },
    });

    created++;
  }

  console.log(`✅ ${created} products processed`);
  console.log("🎉 Database seed completed successfully!");
}

function extractQuantity(name: string): string {
  const match = name.match(/\(([^)]*(?:pcs|Pcs|PCS|Pkt|items|pieces)[^)]*)\)/i);

  if (match) {
    return match[1];
  }

  return "1 Pc";
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });