import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      const { data } = await cartService.getCart();
      setCart(data.cart || { items: [] });
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Cart refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = async (productId, quantity = 1) => {
    await cartService.addToCart(productId, quantity);
    await refresh();
  };
  const remove = async (productId) => {
    await cartService.removeFromCart(productId);
    await refresh();
  };
  const update = async (productId, quantity) => {
    await cartService.updateQuantity(productId, quantity);
    await refresh();
  };
  const clear = async () => {
    await cartService.clearCart();
    await refresh();
  };

  return (
    <CartContext.Provider
      value={{ cart, total, loading, refresh, add, remove, update, clear }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
