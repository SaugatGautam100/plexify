export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity: number;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  sellerId: string;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  userType?: 'user' | 'seller';
  avatar?: string;
  addresses: Address[];
  orders: Order[];
  wishlist: string[];
  createdAt: string;
  // Seller-specific fields (when userType is 'seller')
  businessName?: string;
  businessAddress?: string;
  description?: string;
  rating?: number;
  totalSales?: number;
  isVerified?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessAddress: string;
  phone: string;
  avatar?: string;
  description?: string;
  rating: number;
  totalSales: number;
  products: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  subcategory?: string;
  brand: string;
  stockQuantity: number;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  images: string[];
}