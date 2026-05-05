const Product = require('../models/Product');

/**
 * @desc    Get all products with optional simple filters.
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, brand, q, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = new RegExp(category, 'i');
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (q) filter.$text = { $search: q };

    const products = await Product.find(filter).limit(Number(limit));
    res.json({ count: products.length, products });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single product by ID.
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search products using a structured filter object (used by chatbot).
 *          This is the database-layer search that uses filters extracted by the LLM.
 * @param   {Object} filters - { brand, category, color, size, min_price, max_price, keywords }
 * @returns {Array<Product>}
 */
exports.searchByFilters = async (filters, limit = 12) => {
  const query = {};

  // Use case-insensitive regex for string fields so "jockey" matches "Jockey"
  if (filters.brand) query.brand = new RegExp(escapeRegex(filters.brand), 'i');
  if (filters.category) query.category = new RegExp(escapeRegex(filters.category), 'i');
  if (filters.color) query.color = new RegExp(escapeRegex(filters.color), 'i');
  if (filters.gender) query.gender = new RegExp(escapeRegex(filters.gender), 'i');
  // size match is best-effort — many products in the dataset don't have explicit size
  if (filters.size) {
    query.$or = (query.$or || []).concat([
      { size: filters.size },
      { name: new RegExp(`\\b${escapeRegex(filters.size)}\\b`, 'i') },
    ]);
  }

  // Price range
  if (filters.min_price != null || filters.max_price != null) {
    query.price = {};
    if (filters.min_price != null) query.price.$gte = Number(filters.min_price);
    if (filters.max_price != null) query.price.$lte = Number(filters.max_price);
  }

  // If we have keywords, also try a text search and merge results.
  // For simplicity here, we OR them into the name/description regex.
  if (filters.keywords && filters.keywords.length) {
    const keywordRegex = new RegExp(filters.keywords.map(escapeRegex).join('|'), 'i');
    query.$or = [
      { name: keywordRegex },
      { description: keywordRegex },
      { keywords: keywordRegex },
    ];
  }

  return Product.find(query).limit(limit);
};

// Avoid regex injection from user-controlled input
function escapeRegex(str) {
  return String(str).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
