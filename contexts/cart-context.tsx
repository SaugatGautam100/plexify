'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CartItem, Product } from '@/types';

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

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity: number = 1) => {
    if (!product || !product.productId) {
      console.error('Invalid product data');
      return;
    }

    if (quantity <= 0) {
      console.error('Invalid quantity');
      return;
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.productId);

      if (existingItem) {
        const newQuantity = existingItem.productQuantity + quantity;
        // Check stock limit
        if (newQuantity > product.productStock) {
          console.warn('Cannot add more items than available in stock');
          return currentItems.map(item =>
            item.id === product.productId
              ? { ...item, productQuantity: product.productStock }
              : item
          );
        }
        return currentItems.map(item =>
          item.id === product.productId
            ? { ...item, productQuantity: newQuantity }
            : item
        );
      }

      // Check if requested quantity exceeds stock
      const finalQuantity = Math.min(quantity, product.productStock);

      // Map Product to CartItem
      const cartItem: CartItem = {
        id: product.productId,
        productPrice: product.productPrice,
        productQuantity: finalQuantity,
        productTitle: product.productTitle,
        productImageUris: product.productImageUris,
        productCategory: product.productCategory,
        productStock: product.productStock,
        productUnit: product.productUnit,
        productType: product.productType,
        adminUid: product.adminUid,
        productRandomId: product.productRandomId,
        addedAt: Date.now(),
      };

      return [...currentItems, cartItem];
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
        item.id === productId ? { ...item, productQuantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.productQuantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.productPrice * item.productQuantity), 0);
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

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}