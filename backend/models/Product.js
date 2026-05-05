const mongoose = require('mongoose');

/**
 * Product schema — matches the Myntra-style dataset columns:
 *   name, sku, mpn, price, in_stock, currency, brand, description, images, gender
 *
 * `category` and `color` are NOT in the source CSV — they are derived during
 * ingestion (see backend/utils/categoryExtractor.js and seed/seedFromCSV.js).
 * They are critical for AI filter matching, which is why we materialise them
 * as indexed columns rather than computing them on every query.
 */
const productSchema = new mongoose.Schema(
  {
    sku:      { type: String, required: true, unique: true, index: true },
    mpn:      { type: String, trim: true, index: true },
    name:     { type: String, required: true, trim: true, index: true },
    brand:    { type: String, required: true, trim: true, index: true },

    // Derived during ingestion
    category: { type: String, trim: true, index: true, default: 'Other' },
    color:    { type: String, trim: true, index: true, default: null },

    gender:   { type: String, trim: true, index: true, default: 'Unisex' },
    price:    { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: 'INR' },
    in_stock: { type: Boolean, default: true },

    description: { type: String, default: '' },
    images:      { type: [String], default: [] },

    // Optional UX fields
    rating:        { type: Number, default: 4.0, min: 0, max: 5 },
    originalPrice: { type: Number, min: 0 },
    discount:      { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
