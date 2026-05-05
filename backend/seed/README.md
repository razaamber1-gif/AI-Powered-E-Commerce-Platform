# Database Seeding

This folder contains the script to populate MongoDB with your Myntra product dataset.

## How to use

1. **Place your CSV** at `dataset/myntra_products.csv` (relative to project root).
   - Required columns (header row): `name, sku, mpn, price, in_stock, currency, brand, description, images, gender`
   - Both comma- and tab-separated files are auto-detected.

2. **Run the seeder** from the `backend/` folder:
   ```bash
   npm run seed
   ```

3. **Optional flags / variants:**
   ```bash
   # Wipe existing products before insert (fresh start)
   npm run seed -- --clear

   # Use a CSV at a custom path
   npm run seed -- /absolute/path/to/myntra.csv

   # Combine
   npm run seed -- --clear /path/to/myntra.csv
   ```

## What happens during seeding

For every CSV row, the script:

1. Parses the row (handles commas inside quoted fields)
2. Splits the `images` column on ` ~ ` into a clean array of URLs
3. Converts `"TRUE"` / `"FALSE"` strings into real booleans for `in_stock`
4. **Derives `category`** from the product name (e.g. `"DKNY Unisex Black & Grey Printed Medium Trolley Bag"` → `"Trolley Bag"`)
5. **Derives `color`** from the product name (e.g. → `"Black"`)
6. Normalizes `gender` (`"Unisex"`, `"Men"`, `"Women"`, `"Boys"`, `"Girls"`)
7. Bulk-inserts in batches of 1000 for speed

## Sample output

```
📂 Reading CSV: ../dataset/myntra_products.csv
✅ Connected to MongoDB
🧹 Cleared 0 existing products
🔧 Detected delimiter: TAB
📋 Headers: name, sku, mpn, price, in_stock, currency, brand, description, images, gender

  ⏳ Inserted 12000 products...

✅ Done!
   Inserted: 12453
   Skipped:  47 (missing required fields)
   Errors:   0

📊 Top 15 categories:
   T-shirt              3245
   Jeans                1820
   Shoes                1456
   Kurti                890
   Trolley Bag          412
   ...
```

The script is **idempotent** — re-running it will not create duplicate products (uses `sku` as a unique key).
