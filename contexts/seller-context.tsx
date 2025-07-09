'use client';

import { createContext, useContext, useState } from 'react';
import { Seller, Product } from '@/types';

interface SellerContextType {
  seller: Seller | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateSeller: (updates: Partial<Seller>) => void;
  addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews'>) => Promise<boolean>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  getSellerProducts: () => Product[];
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  businessName: string;
  businessAddress: string;
  phone: string;
  description?: string;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - replace with your implementation
    console.log('Seller login attempt:', { email, password });
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    // Mock register - replace with your implementation
    console.log('Seller register attempt:', data);
    return false;
  };

  const logout = () => {
    setSeller(null);
    setSellerProducts([]);
  };

  const updateSeller = (updates: Partial<Seller>) => {
    if (seller) {
      setSeller({ ...seller, ...updates });
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews'>): Promise<boolean> => {
    // Mock add product - replace with your implementation
    console.log('Add product attempt:', productData);
    return false;
  };

  const updateProduct = async (productId: string, updates: Partial<Product>): Promise<boolean> => {
    // Mock update product - replace with your implementation
    console.log('Update product attempt:', { productId, updates });
    return false;
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    // Mock delete product - replace with your implementation
    console.log('Delete product attempt:', productId);
    return false;
  };

  const getSellerProducts = (): Product[] => {
    return sellerProducts;
  };

  return (
    <SellerContext.Provider
      value={{
        seller,
        login,
        register,
        logout,
        updateSeller,
        addProduct,
        updateProduct,
        deleteProduct,
        getSellerProducts,
        isLoading,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (context === undefined) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
}