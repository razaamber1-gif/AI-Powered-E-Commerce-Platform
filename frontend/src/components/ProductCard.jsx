import { Link } from 'react-router-dom';
import { formatPrice, firstImage, truncate, PLACEHOLDER_IMG } from '../utils/helpers';

export default function ProductCard({ product, compact = false }) {
  if (!product) return null;
  const img = firstImage(product);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount =
    product.discount ||
    (hasDiscount
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <Link
      to={`/product/${product._id}`}
      className={`group block bg-white rounded-md overflow-hidden hover:shadow-lg transition ${
        compact ? 'w-44 flex-shrink-0' : ''
      }`}
    >
      <div className={`bg-gray-50 overflow-hidden ${compact ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}>
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-gray-900 truncate">{product.brand}</h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {truncate(product.name, compact ? 35 : 60)}
        </p>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-sm text-gray-900">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <>
              <span className="text-xs line-through text-gray-400">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-xs font-semibold text-orange-500">({discount}% OFF)</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
