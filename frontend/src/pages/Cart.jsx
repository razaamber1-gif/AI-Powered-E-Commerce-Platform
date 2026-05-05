import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { formatPrice, firstImage, PLACEHOLDER_IMG } from '../utils/helpers';
import Loader from '../components/Loader';

export default function Cart() {
  const { cart, total, loading, update, remove, clear } = useCart();

  if (loading) return <Loader />;

  const items = cart?.items || [];

  const handleQty = async (productId, qty) => {
    try {
      await update(productId, qty);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await remove(productId);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear your entire cart?')) return;
    await clear();
    toast.success('Cart cleared');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="text-2xl font-extrabold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Browse the catalog or use the AI assistant to find products.</p>
        <Link
          to="/"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-md"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <h1 className="text-2xl font-extrabold mb-6">My Cart ({items.length})</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            return (
              <div key={p._id} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
                <Link to={`/product/${p._id}`} className="flex-shrink-0 w-24 sm:w-32">
                  <img
                    src={firstImage(p)}
                    alt={p.name}
                    className="w-full aspect-[3/4] object-cover rounded bg-gray-50"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                  />
                </Link>
                <div className="flex-1 flex flex-col">
                  <Link to={`/product/${p._id}`}>
                    <h3 className="font-bold">{p.brand}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{p.name}</p>
                  </Link>
                  <p className="font-bold mt-2">{formatPrice(p.price)}</p>

                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => handleQty(p._id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-50"
                      >−</button>
                      <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(p._id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-50"
                      >+</button>
                    </div>
                    <button
                      onClick={() => handleRemove(p._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Clear entire cart
          </button>
        </div>

        {/* Price summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
            Price Details ({items.length} items)
          </h2>
          <div className="space-y-3 text-sm">
            <Row label="Total MRP" value={formatPrice(total)} />
            <Row label="Discount" value="—" />
            <Row label="Delivery" value={<span className="text-green-600">FREE</span>} />
            <hr />
            <div className="flex justify-between font-bold text-base">
              <span>Total Amount</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <button className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-md">
            Place Order
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            (Mock checkout — payment not implemented)
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
