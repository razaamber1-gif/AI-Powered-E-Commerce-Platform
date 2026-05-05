const axios = require('axios');
const { searchByFilters } = require('./product.controller');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * @desc    Two-stage AI product search:
 *          1. Send user prompt to Python AI service → get structured filters
 *          2. Use filters to query MongoDB → return matching products
 * @route   POST /api/chatbot/search
 * @access  Public (auth optional)
 *
 * This is the showpiece endpoint. Walk through it during your viva:
 *   prompt → LLM → JSON filters → DB query → products → user
 */
exports.chatbotSearch = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // ── Stage 1: Ask the AI service to extract filters ───────────────────────
    let filters;
    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/extract-filters`,
        { prompt },
        { timeout: 70000 } // CPU LLM can be slow on first call
      );
      filters = aiResponse.data;
    } catch (err) {
      console.error('AI service error:', err.message);
      return res.status(503).json({
        message:
          'AI service is not available. Please make sure the Python service and Ollama are running.',
        error: err.message,
      });
    }

    // ── Stage 2: Search MongoDB with the extracted filters ───────────────────
    const products = await searchByFilters(filters, 12);

    // Construct a friendly assistant reply
    const reply = buildAssistantReply(filters, products);

    res.json({
      reply,
      filters,
      products,
      count: products.length,
    });
  } catch (err) {
    next(err);
  }
};

function buildAssistantReply(filters, products) {
  if (products.length === 0) {
    return `Sorry, I couldn't find any products matching your search. Try rephrasing — for example: "blue Nike shoes under 3000".`;
  }
  const parts = [];
  if (filters.brand) parts.push(filters.brand);
  if (filters.color) parts.push(filters.color.toLowerCase());
  if (filters.gender) parts.push(filters.gender.toLowerCase());
  if (filters.category) parts.push(filters.category.toLowerCase());
  const description = parts.join(' ') || 'products';

  let priceText = '';
  if (filters.max_price && filters.min_price) {
    priceText = ` between ₹${filters.min_price} and ₹${filters.max_price}`;
  } else if (filters.max_price) {
    priceText = ` under ₹${filters.max_price}`;
  } else if (filters.min_price) {
    priceText = ` above ₹${filters.min_price}`;
  }

  return `I found ${products.length} ${description}${priceText} for you 👇`;
}
