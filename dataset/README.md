# Dataset

Place your Myntra-style product CSV file here as `myntra_products.csv`.

Required columns (header row):
```
name, sku, mpn, price, in_stock, currency, brand, description, images, gender
```

After placing the file, run from the `backend/` folder:
```bash
npm run seed -- --clear
```

This will:
1. Read your CSV (comma- or tab-separated, both work)
2. Derive `category` and `color` from each product's name
3. Split the multi-URL `images` column into an array
4. Insert everything into MongoDB

The seeder is idempotent — re-running it won't create duplicates (uses `sku` as a unique key).
