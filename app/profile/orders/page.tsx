'use client';

import React, { useState, useEffect } from 'react';
import { Package, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import app from '../../firebaseConfig';

export default function OrdersPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  // Fallback image URL
  const FALLBACK_IMAGE = 'https://placehold.co/100x100/E0E0E0/808080?text=No+Image';

  // Your Firebase Storage bucket base URL (replace <your-bucket-name> with your actual bucket name)
  const FIREBASE_STORAGE_BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/<your-bucket-name>/o/';

  // Function to construct full Firebase Storage URL if only a path is provided
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) {
      console.warn('Image path is empty or undefined');
      return FALLBACK_IMAGE;
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const encodedPath = encodeURIComponent(imagePath);
    return `${FIREBASE_STORAGE_BASE_URL}${encodedPath}?alt=media`;
  };

  // Handle image load errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

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
            .map((key) => {
              const order = {
                id: key,
                ...ordersData[key],
                // Transform items to ensure productImages is an array
                items: ordersData[key].items?.map((item: any) => ({
                  ...item,
                  productImages: item.productImages
                    ? item.productImages.map((img: string) => getFullImageUrl(img))
                    : item.productImage
                    ? [getFullImageUrl(item.productImage)]
                    : [FALLBACK_IMAGE],
                })),
              };
              return order;
            })
            .sort((a, b) => b.createdAt - a.createdAt);

          // Log productImages for debugging
          fetchedOrders.forEach((order) => {
            order.items?.forEach((item) => {
              console.log(`Product Images for ${item.productTitle}:`, item.productImages);
            });
          });

          setOrders(fetchedOrders);
          // Initialize image indices for each item
          const newImageIndices = fetchedOrders.reduce((acc: any, order: any) => {
            order.items.forEach((item: any) => {
              acc[item.productId] = 0;
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

    return () => {
      off(userOrdersRef, 'value', unsubscribe);
    };
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
              newIndices[item.productId] =
                (prev[item.productId] || 0) + 1 >= imageCount ? 0 : (prev[item.productId] || 0) + 1;
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
            {orders.map((order) => (
              <Card key={order.orderId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order #{order.orderNumber}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
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
                      {order.items &&
                        order.items.map((item: any) => (
                          <div key={item.productId} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={item.productImages[imageIndices[item.productId] || 0]}
                                alt={item.productTitle || 'Product Image'}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                                onError={handleImageError}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.productTitle}</h4>
                              <p className="text-sm text-gray-600">
                                Qty: {item.productQuantity} × Rs.{item.productPrice.toFixed(2)}
                              </p>
                            </div>
                            <div className="font-medium">
                              Rs.{(item.productPrice * item.productQuantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">Rs.{order.finalTotal.toFixed(2)}</span>
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