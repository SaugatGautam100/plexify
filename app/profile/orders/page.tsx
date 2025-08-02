'use client';

import React, { useState, useEffect } from 'react';
import { Package, Calendar, CreditCard, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import Link from 'next/link';
import app from '../../firebaseConfig';

export default function OrdersPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // Fallback image URL
  const FALLBACK_IMAGE = 'https://placehold.co/100x100/E0E0E0/808080?text=No+Image';

  // Handle image load errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('Image failed to load:', e.currentTarget.src);
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

          setOrders(fetchedOrders);
          
          // Initialize image indices for each item
          const newImageIndices = fetchedOrders.reduce((acc: any, order: any) => {
            order.items?.forEach((item: any) => {
              acc[item.productRandomId] = 0;
            });
            return acc;
          }, {});
          setImageIndices(newImageIndices);
          setMessage('');
        } else {
          setOrders([]);
          setImageIndices({});
          setMessage('No orders found.');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setMessage(`Failed to load orders: ${error.message}`);
        setOrders([]);
        setImageIndices({});
        setIsLoading(false);
      }
    );

    return () => off(userOrdersRef, 'value', unsubscribe);
  }, [user, authLoading]);

  // Cycle through images every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        orders.forEach((order) => {
          order.items?.forEach((item: any) => {
            const imageCount = item.productImages?.length || 1;
            if (imageCount > 1) {
              newIndices[item.productRandomId] =
                (prev[item.productRandomId] || 0) + 1 >= imageCount ? 0 : (prev[item.productRandomId] || 0) + 1;
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
          <div
            className={`border px-4 py-3 rounded-lg relative mb-6 ${
              message.includes('successfully') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
            }`}
            role="alert"
          >
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
            {orders.map((order: any) => (
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
                          {order.timestamp?.date || new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {order.timestamp?.time || new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'default'
                          : order.status === 'shipped'
                          ? 'secondary'
                          : order.status === 'processing' || order.status === 'confirmed'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {order.items?.map((item: any) => (
                        <div key={item.productRandomId} className="flex items-center gap-3">
                          <Link
                            href={`/product/${item.productRandomId}`}
                            className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 block"
                            tabIndex={0}
                            aria-label={`View details for ${item.productTitle}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <img
                              src={item.productImages?.[imageIndices[item.productRandomId] || 0] || FALLBACK_IMAGE}
                              alt={item.productTitle || 'Product Image'}
                              className="w-full h-full object-cover rounded-lg"
                              loading="lazy"
                              onError={handleImageError}
                            />
                          </Link>
                          <div className="flex-1">
                            <Link
                              href={`/product/${item.productRandomId}`}
                              className="font-medium text-gray-900 hover:underline block"
                              tabIndex={0}
                              aria-label={`View details for ${item.productTitle}`}
                              style={{ textDecoration: 'none' }}
                            >
                              {item.productTitle}
                            </Link>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Qty: {item.productQuantity} × Rs.{item.productPrice.toFixed(2)}</p>
                              <p>Category: {item.productCategory}</p>
                              <p>Unit: {item.productUnit}</p>
                              <p>Type: {item.productType}</p>
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
                          <span className="text-gray-900">Rs.{(order.finalTotal - 120).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Delivery Charge</span>
                          <span className="text-gray-900">Rs.120.00</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg">
                          <span>Total</span>
                          <span>Rs.{order.finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}