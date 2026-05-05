/**
 * Category & Color extractor — derives structured fields from product names.
 *
 * Why this exists: your Myntra dataset has the category and color buried in
 * the product name string (e.g. "DKNY Unisex Black & Grey Printed Medium
 * Trolley Bag"). The AI search needs structured `category` and `color`
 * columns to query against, so we extract them once during ingestion and
 * store them as indexed fields. That keeps queries fast.
 *
 * Approach: keyword/phrase matching, longest-match-wins, case-insensitive.
 */

// Order matters here: we test longer/more-specific phrases first so that
// "trolley bag" wins over a hypothetical generic "bag" match, and
// "track pants" wins over "pants".
const CATEGORIES = [
  // Bags & Luggage
  ['Trolley Bag',  ['trolley bag', 'trolley', 'luggage', 'suitcase', 'cabin bag']],
  ['Backpack',     ['backpack', 'rucksack', 'laptop bag', 'school bag']],
  ['Handbag',      ['handbag', 'sling bag', 'tote', 'shoulder bag', 'clutch']],
  ['Wallet',       ['wallet', 'purse', 'card holder']],

  // Topwear
  ['T-shirt',      ['t-shirt', 't shirt', 'tshirt', ' tee ', 'polo']],
  ['Shirt',        ['shirt']],          // after t-shirt, polo
  ['Kurti',        ['kurti', 'kurta']],
  ['Top',          [' top ', 'tops', 'tank top', 'crop top', 'tube top']],
  ['Sweatshirt',   ['sweatshirt', 'hoodie', 'pullover']],
  ['Sweater',      ['sweater', 'cardigan', 'jumper']],
  ['Jacket',       ['jacket', 'blazer', 'coat', 'parka']],

  // Bottomwear
  ['Jeans',        ['jeans', 'denim']],
  ['Trousers',     ['trousers', 'chinos', 'formal pants']],
  ['Track Pants',  ['track pant', 'trackpant', 'joggers', 'sweatpant']],
  ['Shorts',       ['shorts', 'bermudas']],
  ['Leggings',     ['leggings', 'jeggings', 'tights']],
  ['Palazzo',      ['palazzo']],
  ['Skirt',        ['skirt']],

  // Ethnic
  ['Saree',        ['saree', 'sari']],
  ['Lehenga',      ['lehenga', 'ghagra']],
  ['Salwar Suit',  ['salwar', 'churidar', 'patiala']],
  ['Dupatta',      ['dupatta', 'stole']],
  ['Sherwani',     ['sherwani', 'achkan']],

  // Dresses & Jumpsuits
  ['Dress',        ['dress', 'gown', 'frock']],
  ['Jumpsuit',     ['jumpsuit', 'playsuit', 'romper']],

  // Footwear
  ['Shoes',        ['shoes', 'sneaker', 'trainer', 'loafer', 'oxford', 'derby', 'brogue']],
  ['Sandals',      ['sandal', 'flip flop', 'slipper', 'floater']],
  ['Heels',        ['heel', 'pump', 'stiletto', 'wedge']],
  ['Boots',        ['boot']],
  ['Flats',        ['flat ', 'ballerina', 'mojari', 'jutti']],

  // Accessories
  ['Watch',        ['watch']],
  ['Sunglasses',   ['sunglass', 'shades', 'eyewear']],
  ['Belt',         ['belt']],
  ['Cap',          ['cap', ' hat ', 'beanie']],
  ['Tie',          [' tie ', 'necktie', 'bow tie']],
  ['Scarf',        ['scarf', 'muffler']],
  ['Socks',        ['socks']],
  ['Gloves',       ['gloves']],

  // Innerwear & sleepwear
  ['Innerwear',    ['brief', 'boxer', 'trunk', 'vest ', 'undershirt']],
  ['Bra',          ['bra ', 'bralette']],
  ['Panty',        ['panty', 'panties', 'thong', 'hipster']],
  ['Sleepwear',    ['pyjama', 'pajama', 'nightwear', 'nightsuit', 'nightie']],

  // Beauty / personal care
  ['Perfume',      ['perfume', 'fragrance', 'deodorant', 'eau de toilette', 'edt']],
  ['Lipstick',     ['lipstick', 'lip gloss', 'lip balm']],
  ['Foundation',   ['foundation', 'concealer', 'compact']],
  ['Kajal',        ['kajal', 'eyeliner', 'mascara']],
  ['Nailpaint',    ['nail paint', 'nail polish', 'nail lacquer']],

  // Jewellery
  ['Earrings',     ['earring', 'studs', 'jhumka']],
  ['Necklace',     ['necklace', 'pendant', 'choker', 'mangalsutra']],
  ['Ring',         [' ring ', 'finger ring']],
  ['Bracelet',     ['bracelet', 'kada', 'bangle']],
  ['Anklet',       ['anklet', 'payal']],

  // Electronics & gadgets (some Myntra catalogs include these)
  ['Headphones',   ['headphone', 'headset']],
  ['Earphones',    ['earphone', 'earbud', 'airpod']],

  // Misc
  ['Tracksuit',    ['tracksuit']],
  ['Co-ord Set',   ['co-ord', 'coord set', 'matching set']],
];

// Common color terms. Order: multi-word first, then singles.
// "navy blue" must be matched before plain "blue" so the longer phrase wins.
const COLORS = [
  'navy blue', 'sky blue', 'royal blue', 'electric blue', 'baby blue',
  'olive green', 'lime green', 'mint green', 'forest green', 'sea green',
  'hot pink', 'baby pink', 'rose pink',
  'off white', 'off-white', 'broken white',
  'dark grey', 'light grey', 'charcoal grey',
  'wine red', 'maroon', 'burgundy', 'rust',
  'mustard', 'beige', 'khaki', 'cream', 'ivory', 'tan', 'camel',
  'turquoise', 'teal', 'aqua', 'cyan',
  'lavender', 'lilac', 'mauve', 'magenta',
  'peach', 'coral', 'salmon',
  'gold', 'silver', 'bronze', 'copper', 'rose gold',
  'multicolor', 'multicoloured', 'multi-color',
  // Single-word colors last so multi-word ones get priority
  'black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple',
  'orange', 'brown', 'grey', 'gray', 'violet'
];

// Gender normalization map (handles dataset variations)
const GENDER_MAP = {
  'men':    'Men',
  'man':    'Men',
  'male':   'Men',
  'women':  'Women',
  'woman':  'Women',
  'female': 'Women',
  'unisex': 'Unisex',
  'boys':   'Boys',
  'boy':    'Boys',
  'girls':  'Girls',
  'girl':   'Girls',
  'kids':   'Kids',
};

/**
 * Find category by scanning the product name for known keywords.
 * Returns the first matching category (since we ordered the list specific→generic).
 */
function extractCategory(name = '') {
  const lower = ` ${name.toLowerCase()} `; // pad with spaces for word-boundary matches like ' tee '
  for (const [category, keywords] of CATEGORIES) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }
  return 'Other';
}

/**
 * Find color in the product name. Returns the first match (longest-first ordering
 * means "navy blue" beats "blue").
 */
function extractColor(name = '') {
  const lower = name.toLowerCase();
  for (const color of COLORS) {
    // simple substring check is fine here; product names are short
    if (lower.includes(color)) {
      // Capitalise nicely: "navy blue" → "Navy Blue"
      return color.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return null;
}

/**
 * Normalize gender from CSV (handles "Men", "men", "MENS", "Unisex", etc.)
 */
function normalizeGender(raw = '') {
  const key = String(raw).trim().toLowerCase();
  return GENDER_MAP[key] || 'Unisex';
}

/**
 * Convert "TRUE"/"FALSE"/true/1 to a real boolean.
 */
function parseBool(v) {
  if (typeof v === 'boolean') return v;
  if (v == null) return true; // default: in stock
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'y';
}

/**
 * Split the " ~ "-separated images string into a clean array of URLs.
 */
function parseImages(raw = '') {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (!raw) return [];
  return String(raw)
    .split(/\s*~\s*/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith('http'));
}

/**
 * Take one raw row from the CSV and return a clean product object ready to
 * insert into MongoDB.
 */
function normalizeProduct(row) {
  const name = (row.name || '').trim();
  return {
    sku:        String(row.sku || row.mpn || '').trim(),
    mpn:        String(row.mpn || '').trim(),
    name,
    brand:      String(row.brand || 'Generic').trim(),
    category:   extractCategory(name),
    color:      extractColor(name),
    gender:     normalizeGender(row.gender),
    price:      Number(row.price) || 0,
    currency:   String(row.currency || 'INR').toUpperCase().trim(),
    in_stock:   parseBool(row.in_stock),
    description: String(row.description || '').trim(),
    images:     parseImages(row.images),
  };
}

module.exports = {
  extractCategory,
  extractColor,
  normalizeGender,
  parseBool,
  parseImages,
  normalizeProduct,
};
