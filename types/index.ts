export interface Product {
  adminUid: string;
  itemCount: number;
  productCategory: string;
  productId: string;
  productImageUris: string[];
  productPrice: number;
  productQuantity: number;
  productRandomId: string;
  productStock: number;
  productTitle: string;
  productType: string;
  productUnit: string;
}

export interface CartItem {
  id: string;
  productPrice: number;
  productQuantity: number;
  productTitle: string;
  productImageUris?: string[];
  productCategory: string;
  productStock: number;
  productUnit: string;
  productType: string;
  adminUid: string;
  productRandomId?: string;
  addedAt?: number;
}

export interface OrderTimestamp {
  createdAt: number;
  date: string;
  time: string;
  iso: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productPrice: number;
  productQuantity: number;
  productImages: string[];
  productCategory: string;
  productUnit: string;
  productType: string;
  adminUid: string;
  productRandomId?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  userEmail: string;
  orderNumber: string;
  timestamp: OrderTimestamp;
  createdAt: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  finalTotal: number;
}

export interface User {
  id: string;
  UserName: string;
  UserEmail: string;
  UserPhone?: string;
  UserAddress?: string;
  UserType?: 'user' | 'seller';
  avatar?: string;
  createdAt: number;
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