'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number = 1) => {
    if (!product || !product.id) {
      console.error('Invalid product data');
      return;
    }
    
    if (quantity <= 0) {
      console.error('Invalid quantity');
      return;
    }
    
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Check stock limit
        if (newQuantity > product.stockQuantity) {
          console.warn('Cannot add more items than available in stock');
          return currentItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: product.stockQuantity }
              : item
          );
        }
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Check if requested quantity exceeds stock
      const finalQuantity = Math.min(quantity, product.stockQuantity);
      return [...currentItems, { id: product.id, product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}