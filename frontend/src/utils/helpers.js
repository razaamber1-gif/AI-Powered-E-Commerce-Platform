/**
 * Format a price as Indian Rupees with thousand-separator commas.
 *   formatPrice(11745)  → "₹11,745"
 */
export const formatPrice = (n) => {
  if (n == null || isNaN(n)) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
};

/**
 * Trim a long string to a max length with ellipsis.
 */
export const truncate = (str, max = 60) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max).trim() + '…' : str;
};

/**
 * Get the first usable image URL from a product. Falls back to a placeholder.
 */
export const firstImage = (product) => {
  if (!product) return PLACEHOLDER_IMG;
  if (Array.isArray(product.images) && product.images.length) return product.images[0];
  if (product.image) return product.image;
  return PLACEHOLDER_IMG;
};

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
       <rect width="100%" height="100%" fill="#f3f4f6"/>
       <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#9ca3af"
             dominant-baseline="middle" text-anchor="middle">No image</text>
     </svg>`
  );
