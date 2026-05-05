/**
 * seedFromCSV.js
 * ──────────────
 * One-shot script that ingests a Myntra-style CSV into MongoDB.
 *
 * Expected CSV columns (header row required):
 *   name, sku, mpn, price, in_stock, currency, brand, description, images, gender
 *
 * Run with:
 *   npm run seed                          (default: ../dataset/myntra_products.csv)
 *   npm run seed -- /path/to/file.csv     (custom path)
 *
 * What it does:
 *   1. Streams the CSV row by row (handles huge files without loading into RAM)
 *   2. For each row, derives `category` and `color` from the product name
 *      and splits the `images` string into an array
 *   3. Bulk-inserts in batches of 1000 for speed
 *   4. Skips duplicates (by sku) so the script is safely re-runnable
 *   5. Prints a summary of categories and brands at the end
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const { normalizeProduct } = require('../utils/categoryExtractor');

const DEFAULT_CSV = path.join(__dirname, '..', '..', 'dataset', 'myntra_products.csv');
const csvPath = process.argv[2] || DEFAULT_CSV;
const BATCH_SIZE = 1000;
const SHOULD_CLEAR = process.env.SEED_CLEAR === 'true' || process.argv.includes('--clear');

/**
 * Tiny CSV line parser that handles quoted fields containing commas/quotes.
 * Avoids pulling in a heavy CSV library; fine for well-formed Myntra exports.
 */
function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if ((ch === ',' || ch === '\t') && !inQuotes) {
      fields.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

async function run() {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    console.error('   Tip: place your Myntra CSV at  ./dataset/myntra_products.csv');
    console.error('   Or pass a path:  npm run seed -- /path/to/file.csv');
    process.exit(1);
  }

  console.log(`📂 Reading CSV: ${csvPath}`);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  if (SHOULD_CLEAR) {
    const r = await Product.deleteMany({});
    console.log(`🧹 Cleared ${r.deletedCount} existing products`);
  }

  // Detect delimiter (comma vs tab) from header line
  const firstLine = await readFirstLine(csvPath);
  const delimiter = firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',';
  console.log(`🔧 Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`);

  const headers = parseCSVLine(firstLine).map((h) => h.trim().toLowerCase());
  console.log('📋 Headers:', headers.join(', '));

  const stream = fs.createReadStream(csvPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let lineNum = 0;
  let batch = [];
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  const categoryCounts = {};
  const brandCounts = {};

  for await (const rawLine of rl) {
    lineNum++;
    if (lineNum === 1) continue;        // skip header
    if (!rawLine.trim()) continue;       // skip blank lines

    try {
      const cells = parseCSVLine(rawLine);
      const row = {};
      headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });

      const product = normalizeProduct(row);

      // Skip rows missing critical fields
      if (!product.sku || !product.name || !product.price) {
        skipped++;
        continue;
      }

      batch.push(product);
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
      brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;

      if (batch.length >= BATCH_SIZE) {
        const n = await flushBatch(batch);
        inserted += n;
        batch = [];
        process.stdout.write(`\r  ⏳ Inserted ${inserted} products...`);
      }
    } catch (err) {
      errors++;
      if (errors < 5) console.error(`\n  ⚠️  Row ${lineNum} error:`, err.message);
    }
  }

  // Flush remainder
  if (batch.length) {
    const n = await flushBatch(batch);
    inserted += n;
  }

  console.log(`\n\n✅ Done!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped:  ${skipped} (missing required fields)`);
  console.log(`   Errors:   ${errors}`);

  console.log('\n📊 Top 15 categories:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 15)
    .forEach(([cat, n]) => console.log(`   ${cat.padEnd(20)} ${n}`));

  console.log('\n🏷️  Top 15 brands:');
  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 15)
    .forEach(([b, n]) => console.log(`   ${b.padEnd(25)} ${n}`));

  await mongoose.disconnect();
  process.exit(0);
}

async function flushBatch(batch) {
  try {
    // ordered:false → continue on duplicate-key errors (re-runnable)
    const res = await Product.insertMany(batch, { ordered: false });
    return res.length;
  } catch (err) {
    // Mongo bulk insert: count successful writes even when some duplicates collide
    if (err.insertedDocs) return err.insertedDocs.length;
    if (err.result && err.result.nInserted != null) return err.result.nInserted;
    return 0;
  }
}

function readFirstLine(filePath) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });
    rl.on('line', (line) => { rl.close(); stream.destroy(); resolve(line); });
    rl.on('error', reject);
  });
}

run().catch((err) => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
