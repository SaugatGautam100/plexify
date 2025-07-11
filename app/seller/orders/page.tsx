'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Calendar, CreditCard, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.userType !== 'seller') {
      router.push('/seller/login');
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, updateData) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Order Updated',
          description: 'Order status has been updated successfully.',
        });
        fetchOrders();
        setSelectedOrder(null);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update order.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const updateData = {
      status: formData.get('status'),
      trackingNumber: formData.get('trackingNumber'),
      deliveryPartner: formData.get('deliveryPartner'),
      cancellationReason: formData.get('cancellationReason'),
    };

    // Remove empty fields
    Object.keys(updateData).forEach(key => {
      if (!updateData[key]) delete updateData[key];
    });

    updateOrderStatus(selectedOrder.id, updateData);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-600">Orders containing your products will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              // Filter items to show only seller's products
              const sellerItems = order.items.filter(item => item.sellerId === session.user.id);
              if (sellerItems.length === 0) return null;

              return (
                <Card key={order.id}>
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
                          <span>Customer: {order.userName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          order.status === 'delivered' ? 'default' :
                          order.status === 'shipped' ? 'secondary' :
                          order.status === 'processing' || order.status === 'confirmed' ? 'outline' : 'destructive'
                        }>
                          {order.status}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Order Status</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleStatusUpdate} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="status">Order Status</Label>
                                <Select name="status" defaultValue={order.status}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="trackingNumber">Tracking Number (Optional)</Label>
                                <Input
                                  id="trackingNumber"
                                  name="trackingNumber"
                                  placeholder="Enter tracking number"
                                  defaultValue={order.trackingNumber || ''}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="deliveryPartner">Delivery Partner (Optional)</Label>
                                <Input
                                  id="deliveryPartner"
                                  name="deliveryPartner"
                                  placeholder="e.g., FedEx, UPS, DHL"
                                  defaultValue={order.deliveryPartner || ''}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="cancellationReason">Cancellation Reason (If cancelling)</Label>
                                <Textarea
                                  id="cancellationReason"
                                  name="cancellationReason"
                                  placeholder="Reason for cancellation"
                                  defaultValue={order.cancellationReason || ''}
                                />
                              </div>

                              <Button type="submit" disabled={isUpdating} className="w-full">
                                {isUpdating ? 'Updating...' : 'Update Order'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Seller's Items */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Your Products in this Order:</h4>
                        {sellerItems.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg">
                              <img 
                                src={item.productImage} 
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{item.productName}</h5>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ${item.price}
                              </p>
                            </div>
                            <div className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Details */}
                      {order.trackingNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4" />
                          <span>Tracking: {order.trackingNumber}</span>
                          {order.deliveryPartner && <span>via {order.deliveryPartner}</span>}
                        </div>
                      )}

                      {order.status === 'delivered' && order.deliveredAt && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span>Cancelled: {order.cancellationReason || 'No reason provided'}</span>
                        </div>
                      )}
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