'use client';

import { createContext, useContext, useState } from 'react';
import { Seller, Product, ProductFormData } from '@/types';
import { useSession } from 'next-auth/react';

interface SellerContextType {
  seller: Seller | null;
  login: (email: string, password: string) => Promise<boolean>;
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
  const { data: session } = useSession();

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - replace with your implementation
    console.log('Seller login attempt:', { email, password });
    // For now, we'll use the session user as seller
    if (session?.user) {
      const mockSeller: Seller = {
        id: session.user.id || '1',
        name: session.user.name || 'Seller',
        email: session.user.email || 'seller@example.com',
        businessName: 'My Business',
        businessAddress: '123 Business St',
        phone: '+1234567890',
        description: 'My business description',
        rating: 4.5,
        totalSales: 0,
        products: [],
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      setSeller(mockSeller);
      await refreshProducts();
      return true;
    }
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    // Mock register - replace with your implementation
    console.log('Seller register attempt:', data);
    // For now, we'll use the session user as seller
    if (session?.user) {
      const mockSeller: Seller = {
        id: session.user.id || '1',
        name: data.name,
        email: data.email,
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        phone: data.phone,
        description: data.description,
        rating: 4.5,
        totalSales: 0,
        products: [],
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      setSeller(mockSeller);
      return true;
    }
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
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/products?sellerId=${session.user.id}`);
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