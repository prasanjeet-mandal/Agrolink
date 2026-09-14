import * as React from 'react';

const CartContext = React.createContext(null);

const STORAGE_KEY = 'agrolink_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = React.useState(loadCart);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = React.useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          icon: product.icon,
          unit: product.unit,
          pricePerUnit: product.pricePerUnit,
          producerId: product.producerId,
          producerName: product.producerName,
          image: product.image,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = React.useCallback((productId, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }, []);

  const removeItem = React.useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const { subtotal, itemCount } = React.useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.pricePerUnit * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, itemCount };
  }, [items]);

  const value = React.useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clear, subtotal, itemCount }),
    [items, addItem, updateQuantity, removeItem, clear, subtotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}