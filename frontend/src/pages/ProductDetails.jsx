import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, PLACEHOLDER_IMG } from '../utils/helpers';
import Loader from '../components/Loader';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setActiveImg(0);
    getProductById(id)
      .then(({ data }) => { if (mounted) setProduct(data.product); })
      .catch(() => { if (mounted) toast.error('Product not found'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  const handleAdd = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await add(product._id, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Product not found.</p>
      </div>
    );
  }

  const images = product.images && product.images.length ? product.images : [PLACEHOLDER_IMG];
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discount =
    product.discount ||
    (hasDiscount
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          <div className="bg-gray-50 rounded-lg overflow-hidden aspect-[3/4] mb-3">
            <img
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`bg-gray-50 rounded overflow-hidden aspect-square border-2 ${
                    activeImg === idx ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover"
                       onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-extrabold">{product.brand}</h1>
          <p className="text-gray-700 mt-1">{product.name}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-orange-500 font-bold">({discount}% OFF)</span>
              </>
            )}
          </div>
          <p className="text-xs text-green-600 mt-1 font-semibold">Inclusive of all taxes</p>

          {/* Specs */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Spec label="Category" value={product.category} />
            <Spec label="Color" value={product.color || '—'} />
            <Spec label="Gender" value={product.gender} />
            <Spec
              label="Stock"
              value={product.in_stock ? <span className="text-green-600">In stock</span> : <span className="text-red-600">Out of stock</span>}
            />
          </div>

          {/* Add to cart */}
          <div className="mt-8 flex gap-3">
            <button
              disabled={!product.in_stock || adding}
              onClick={handleAdd}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-md transition flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t pt-6">
              <h2 className="font-bold mb-2">Product Description</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase font-bold text-gray-400 tracking-wide">{label}</p>
      <p className="text-sm font-semibold mt-1">{value}</p>
    </div>
  );
}
