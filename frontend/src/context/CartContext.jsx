import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const emptyCart = { id: null, items: [], totalAmount: 0, totalItems: 0 };

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(emptyCart);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1, size) => {
    const { data } = await api.post('/cart/items', { productId, quantity, size });
    setCart(data);
    return data;
  };

  const updateItem = async (itemId, quantity, productId) => {
    const { data } = await api.put(`/cart/items/${itemId}`, { productId, quantity });
    setCart(data);
    return data;
  };

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    setCart(data);
    return data;
  };

  const clearCart = async () => {
    const { data } = await api.delete('/cart');
    setCart(data);
    return data;
  };

  const value = useMemo(
    () => ({ cart, loading, refreshCart, addToCart, updateItem, removeItem, clearCart }),
    [cart, loading, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
