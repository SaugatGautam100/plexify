'use client';

import { createContext, useContext, useState } from 'react';
import { Seller, Product, ProductFormData } from '@/types';

interface SellerContextType {
  seller: Seller | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithData: (sellerData: Seller) => void;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateSeller: (updates: Partial<Seller>) => void;
  addProduct: (product: ProductFormData) => Promise<boolean>;
  updateProduct: (productId: string, updates: ProductFormData) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  getSellerProducts: () => Product[];
  refreshProducts: () => Promise<void>;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  description?: string;
}

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seller/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSeller(data.seller);
        await refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithData = (sellerData: Seller) => {
    setSeller(sellerData);
    refreshProducts();
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seller/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/seller/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setSeller(null);
    setSellerProducts([]);
  };

  const updateSeller = (updates: Partial<Seller>) => {
    if (seller) {
      setSeller({ ...seller, ...updates });
    }
  };

  const addProduct = async (productData: ProductFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  };

  const updateProduct = async (productId: string, updates: ProductFormData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  };

  const getSellerProducts = (): Product[] => {
    return sellerProducts;
  };

  const refreshProducts = async () => {
    if (!seller?.id) return;
    
    try {
      const response = await fetch(`/api/products?sellerId=${seller.id}`);
      if (response.ok) {
        const data = await response.json();
        setSellerProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching seller products:', error);
    }
  };

  return (
    <SellerContext.Provider
      value={{
        seller,
        login,
        loginWithData,
        register,
        logout,
        updateSeller,
        addProduct,
        updateProduct,
        deleteProduct,
        getSellerProducts,
        refreshProducts,
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