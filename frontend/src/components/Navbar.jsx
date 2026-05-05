import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const itemCount = cart?.items?.length || 0;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-primary-500 tracking-tight">
            Shopzy
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 font-semibold uppercase tracking-wider">
            AI Search
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          <Link to="/" className="hover:text-primary-500 transition">Home</Link>
          <Link to="/?category=Men" className="hover:text-primary-500 transition">Men</Link>
          <Link to="/?category=Women" className="hover:text-primary-500 transition">Women</Link>
          <Link to="/?category=Kids" className="hover:text-primary-500 transition">Kids</Link>
        </nav>

        {/* Right cluster: profile + cart */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 hover:text-primary-500"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 grid place-items-center font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-semibold">
                  {user.name?.split(' ')[0]}
                </span>
              </button>
              {open && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-40 animate-slide-up">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/cart"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Cart
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 hover:text-primary-500"
            >
              Login
            </Link>
          )}

          <Link to="/cart" className="relative">
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor"
                 strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 grid place-items-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
