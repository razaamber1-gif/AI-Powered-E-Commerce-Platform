import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const QUICK_FILTERS = [
  'T-shirt', 'Jeans', 'Shoes', 'Kurti', 'Saree', 'Trolley Bag',
  'Watch', 'Backpack', 'Sunglasses', 'Dress',
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAllProducts({ category, limit: 60 })
      .then(({ data }) => { if (mounted) setProducts(data.products); })
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [category]);

  const setCategory = (c) => {
    if (c) setSearchParams({ category: c });
    else setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* Hero banner */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl px-6 py-8 mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Shop Smarter with AI 🤖
          </h1>
          <p className="text-primary-100 mt-2 text-sm sm:text-base">
            Click the “Search with AI Agent” button at the bottom-right and tell us what you want — in plain English.
          </p>
        </div>
        <div className="hidden sm:block text-7xl">🛍️</div>
      </section>

      {/* Quick category filter chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto chat-scroll pb-2">
        <button
          onClick={() => setCategory('')}
          className={`whitespace-nowrap px-4 py-1.5 text-sm rounded-full border ${
            !category ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
          }`}
        >
          All
        </button>
        {QUICK_FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap px-4 py-1.5 text-sm rounded-full border ${
              category === c ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <Loader label="Loading products..." />
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-2">Have you run <code className="bg-gray-100 px-2 py-0.5 rounded">npm run seed</code> in the backend?</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-3">
            Showing <strong>{products.length}</strong> products
            {category && <> in <strong>{category}</strong></>}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
