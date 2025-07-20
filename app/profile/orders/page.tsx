'use client';

import React, { useState, useEffect } from 'react';
import { Package, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context'; // Assuming this provides user and loading state
import { getDatabase, ref, onValue, off } from 'firebase/database'; // Import Firebase functions
import app from '../../firebaseConfig'; // Import your Firebase config

export default function OrdersPage() {
  const { user, loading: authLoading } = useFirebaseAuth(); // Get user and auth loading state
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) {
      // Still loading authentication status
      return;
    }

    if (!user) {
      // User is not logged in, or session expired.
      // You might want to redirect to login here if not handled by useFirebaseAuth.
      setIsLoading(false);
      setMessage("Please log in to view your orders.");
      setOrders([]);
      return;
    }

    const db = getDatabase(app);
    const userOrdersRef = ref(db, `AllUsers/Users/${user.uid}/UserOrders`);

    setIsLoading(true);
    setMessage('');

    // Set up a real-time listener for user's orders
    const unsubscribe = onValue(userOrdersRef, (snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        // Convert the object of orders into an array, sorting by createdAt descending
        const fetchedOrders = Object.keys(ordersData).map(key => ({
          id: key,
          ...ordersData[key]
        })).sort((a, b) => b.createdAt - a.createdAt); // Sort by most recent first
        setOrders(fetchedOrders);
        setMessage('');
      } else {
        setOrders([]);
        setMessage("No orders found.");
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setMessage(`Failed to load orders: ${error.message}`);
      setOrders([]);
      setIsLoading(false);
    });

    // Clean up the listener when the component unmounts or user changes
    return () => {
      off(userOrdersRef, 'value', unsubscribe);
    };
  }, [user, authLoading]); // Re-run effect when user or authLoading changes

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
              <Card key={order.orderId}> {/* Use order.orderId as key */}
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
                    <Badge variant={
                      order.status === 'delivered' ? 'default' :
                      order.status === 'shipped' ? 'secondary' :
                      order.status === 'processing' || order.status === 'confirmed' ? 'outline' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items && order.items.map((item) => ( // Ensure items exist before mapping
                        <div key={item.productId} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={item.productImage || 'https://placehold.co/100x100/E0E0E0/808080?text=No+Image'} // Fallback image
                              alt={item.productTitle || 'Product Image'} // Use productTitle for alt
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productTitle}</h4> {/* Use productTitle */}
                            <p className="text-sm text-gray-600">
                              Qty: {item.productQuantity} × Rs.{item.productPrice.toFixed(2)} {/* Use productQuantity and productPrice */}
                            </p>
                          </div>
                          <div className="font-medium">
                            Rs.{(item.productPrice * item.productQuantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">Rs.{order.finalTotal.toFixed(2)}</span> {/* Use finalTotal */}
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
