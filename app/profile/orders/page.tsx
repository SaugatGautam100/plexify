'use client';

import React, { useState, useEffect } from 'react';
import { Package, Calendar, CreditCard, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import Link from 'next/link';
import app from '../../firebaseConfig';

interface OrderItem {
  productId: string;
  productTitle: string;
  productPrice: number;
  productQuantity: number;
  productImages: string[];
  productCategory: string;
  productUnit: string;
  productType: string;
}

interface Order {
  id: string;
  orderId: string;
  orderNumber: string;
  createdAt: number;
  paymentMethod: string;
  status: 'pending' | 'received' | 'dispatched' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  finalTotal: number;
}

const getStatusBadgeVariant = (status: Order['status']): BadgeProps['variant'] => {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'dispatched':
      return 'outline';
    case 'received':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'pending':
    default:
      return 'secondary';
  }
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  const FALLBACK_IMAGE = 'https://placehold.co/100x100/E0E0E0/808080?text=No+Image';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      setMessage('Please log in to view your orders.');
      setOrders([]);
      return;
    }

    const db = getDatabase(app);
    const userOrdersRef = ref(db, `AllUsers/Users/${user.uid}/UserOrders`);

    setIsLoading(true);
    setMessage('');

    const unsubscribe = onValue(
      userOrdersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          const fetchedOrders = Object.keys(ordersData)
            .map((key) => ({
              id: key,
              ...ordersData[key],
            }))
            .sort((a, b) => b.createdAt - a.createdAt);

          setOrders(fetchedOrders as Order[]);
          setMessage('');
        } else {
          setOrders([]);
          setMessage('No orders found.');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setMessage(`Failed to load orders: ${error.message}`);
        setOrders([]);
        setIsLoading(false);
      }
    );

    return () => off(userOrdersRef, 'value', unsubscribe);
  }, [user, authLoading]);

  useEffect(() => {
    const initialIndices: { [key: string]: number } = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        initialIndices[order.id + item.productId] = 0;
      });
    });
    setImageIndices(initialIndices);

    const interval = setInterval(() => {
      setImageIndices(prev => {
        const newIndices = { ...prev };
        orders.forEach(order => {
          order.items?.forEach(item => {
            const key = order.id + item.productId;
            const imageCount = item.productImages?.length || 1;
            if (imageCount > 1) {
              newIndices[key] = (prev[key] || 0) + 1 >= imageCount ? 0 : (prev[key] || 0) + 1;
            }
          });
        });
        return newIndices;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [orders]);

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {message && (
          <div className="border px-4 py-3 rounded-lg relative mb-6 bg-blue-100 border-blue-400 text-blue-700" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-600">When you place orders, they'll appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const deliveryCharge = 120; // Always Rs.120
              const subtotal = order.subtotal || 0;
              const finalTotal = subtotal + deliveryCharge;
              return (
                <Card key={order.orderId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Order #{order.orderNumber}
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {order.items?.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3">
                            <Link href={`/product/${item.productId}`} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 block">
                              <img
                                src={item.productImages?.[imageIndices[order.id + item.productId] || 0] || FALLBACK_IMAGE}
                                alt={item.productTitle || 'Product Image'}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                                onError={handleImageError}
                              />
                            </Link>
                            <div className="flex-1">
                              <Link href={`/product/${item.productId}`} className="font-medium text-gray-900 hover:underline block">
                                {item.productTitle}
                              </Link>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Qty: {item.productQuantity} × Rs.{(item.productPrice || 0).toFixed(2)}</p>
                                <p>Category: {item.productCategory}</p>
                              </div>
                            </div>
                            <div className="font-medium">
                              Rs.{(item.productPrice * item.productQuantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">Rs.{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Delivery Charge</span>
                            <span className="text-gray-900">Rs.{deliveryCharge.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span>Rs.{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}