'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [items, setItems] = useState<Product[]>([]);

  // Uncomment to persist wishlist in localStorage
  // useEffect(() => {
  //   const savedWishlist = localStorage.getItem('wishlist');
  //   if (savedWishlist) {
  //     try {
  //       setItems(JSON.parse(savedWishlist));
  //     } catch (error) {
  //       console.error('Error loading wishlist from localStorage:', error);
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem('wishlist', JSON.stringify(items));
  // }, [items]);

  const addItem = (product: Product) => {
    if (!product || !product.productId) {
      console.error('Invalid product data');
      return;
    }

    setItems(currentItems => {
      const exists = currentItems.find(item => item.productId === product.productId);
      if (exists) return currentItems;
      return [...currentItems, product];
    });
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}