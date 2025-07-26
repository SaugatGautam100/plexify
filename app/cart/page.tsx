'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import CartItem from '@/components/cart/cart-item';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, get, remove, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import app from '@/app/firebaseConfig';

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();
  const [items, setItems] = useState<Array<{ id: string; productPrice: number; productQuantity: number; productTitle: string; productImageUris?: string[]; productCategory: string; productStock: number; productUnit: string; productType: string; adminUid: string; productRandomId?: string }>>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItem, setDialogItem] = useState<{ id: string; productTitle: string } | null>(null);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  const fetchCartItems = async () => {
    if (!user) return;

    setCartLoading(true);
    setMessage('');
    try {
      const db = getDatabase(app);
      const cartRef = ref(db, `AllUsers/Users/${user.uid}/UserCartItems`);
      const snapshot = await get(cartRef);

      if (snapshot.exists()) {
        const cartData = snapshot.val();
        const cartItems = Object.keys(cartData).map((key) => ({
          id: key,
          ...cartData[key]
        }));
        setItems(cartItems);
        setImageIndices(cartItems.reduce((acc, item) => ({
          ...acc,
          [item.id]: 0
        }), {}));
      } else {
        setItems([]);
        setImageIndices({});
      }
    } catch (error: any) {
      console.error("Error fetching cart items:", error.message, error.code);
      setItems([]);
      setImageIndices({});
      setMessage(`Failed to load cart: ${error.message}`);
    } finally {
      setCartLoading(false);
    }
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.productPrice * item.productQuantity || 0), 0);
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const db = getDatabase(app);
      const cartRef = ref(db, `AllUsers/Users/${user.uid}/UserCartItems`);
      await remove(cartRef);
      setItems([]);
      setImageIndices({});
      setMessage('Cart cleared successfully!');
    } catch (error: any) {
      console.error("Error clearing cart:", error.message, error.code);
      setMessage(`Failed to clear cart: ${error.message}`);
    }
  };

  const handleDeleteFromCart = async (id: string, productTitle: string) => {
    if (!user) {
      setMessage('Please log in to remove items from your cart.');
      return;
    }

    try {
      const db = getDatabase(app);
      const itemRef = ref(db, `AllUsers/Users/${user.uid}/UserCartItems/${id}`);
      await remove(itemRef);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        delete newIndices[id];
        return newIndices;
      });
      setMessage(`"${productTitle}" removed from cart successfully!`);
      await fetchCartItems();
    } catch (error: any) {
      console.error("Error removing item from cart:", error.message, error.code);
      setMessage(`Failed to remove "${productTitle}" from cart: ${error.message}`);
    }
  };

  const openConfirmDialog = (id: string, productTitle: string) => {
    if (!id || !productTitle) {
      console.error("Invalid id or productTitle:", { id, productTitle });
      setMessage("Unable to remove item: Invalid data.");
      return;
    }
    setDialogItem({ id, productTitle });
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (dialogItem) {
      handleDeleteFromCart(dialogItem.id, dialogItem.productTitle);
    }
    setDialogOpen(false);
    setDialogItem(null);
  };

  const handleProceedToCheckout = () => {
    setCheckoutDialogOpen(true);
  };

  const saveNotificationToFirebase = async (userId: string, title: string, message: string) => {
    try {
      const db = getDatabase(app);
      const notificationsRef = ref(db, `AllUsers/Users/${userId}/UserNotifications`);
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, {
        title,
        message,
        timestamp: Date.now(),
        read: false,
      });
      if (document.visibilityState !== 'visible' && Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/favicon.ico' });
      }
    } catch (error: any) {
      console.error("Error saving notification to Firebase:", error);
      setMessage(`Error saving notification: ${error.message}`);
    }
  };

  const handleConfirmCheckout = async () => {
    setCheckoutDialogOpen(false);
    setMessage('');

    if (!user) {
      setMessage("You must be logged in to place an order.");
      return;
    }
    if (items.length === 0) {
      setMessage("Your cart is empty. Please add items before checking out.");
      return;
    }

    try {
      const db = getDatabase(app);
      const auth = getAuth(app);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setMessage("Authentication error. Please log in again.");
        return;
      }

      const userProfileRef = ref(db, `AllUsers/Users/${currentUser.uid}`);
      const userProfileSnapshot = await get(userProfileRef);
      let userName = '';
      let userAddress = '';
      let userPhone = '';
      let userEmail = '';

      if (userProfileSnapshot.exists()) {
        const profileData = userProfileSnapshot.val();
        userName = profileData.UserName || '';
        userAddress = profileData.UserAddress || '';
        userPhone = profileData.UserPhone || '';
        userEmail = profileData.UserEmail || '';
      }

      const orderRefUser = ref(db, `AllUsers/Users/${currentUser.uid}/UserOrders`);
      const orderRefAdmin = ref(db, `Admins/AllUserOrders`);

      const newOrderRef = push(orderRefUser);
      const orderId = newOrderRef.key;

      const orderData = {
        orderId: orderId,
        userId: currentUser.uid,
        userName: userName,
        userAddress: userAddress,
        userPhone: userPhone,
        userEmail: userEmail,
        orderNumber: `ORD-${Date.now()}`,
        createdAt: Date.now(),
        paymentMethod: 'Cash on Delivery',
        status: 'pending',
        items: items.map(item => ({
          productId: item.id,
          productTitle: item.productTitle,
          productPrice: item.productPrice,
          productQuantity: item.productQuantity,
          productImages: item.productImageUris && item.productImageUris.length > 0 ? item.productImageUris : ['https://placehold.co/100x100/E0E0E0/808080?text=No+Image'],
          productCategory: item.productCategory,
          productUnit: item.productUnit,
          productType: item.productType,
          adminUid: item.adminUid,
          productRandomId: item.productRandomId || null,
        })),
        subtotal: getTotal(),
        shipping: total > 50 ? 0 : 10,
        tax: total * 0.08,
        finalTotal: finalTotal,
      };

      await set(newOrderRef, orderData);
      await set(ref(db, `Admins/AllUserOrders/${orderId}`), orderData);

      const itemDetails = orderData.items.map(item => 
        `- Title: ${item.productTitle}; Price: Rs.${item.productPrice.toFixed(2)}; Quantity: ${item.productQuantity}; Category: ${item.productCategory}; Unit: ${item.productUnit}; Type: ${item.productType}; Images: [${item.productImages.join(', ')}]`
      ).join('\n');
      
      const notificationMessage = `Dear ${userName},\nYour order ${orderData.orderNumber} has been placed successfully!\n\nOrder Items:\n${itemDetails}\n\nShipping to: ${userAddress}\nSubtotal: Rs.${orderData.subtotal.toFixed(2)}\nShipping: ${orderData.shipping === 0 ? 'Free' : `Rs.${orderData.shipping.toFixed(2)}`}\nTax: Rs.${orderData.tax.toFixed(2)}\nTotal: Rs.${orderData.finalTotal.toFixed(2)}`;

      await saveNotificationToFirebase(
        currentUser.uid,
        "Order Placed Successfully",
        notificationMessage
      );

      await clearCart();

      setMessage("Order placed successfully! Redirecting to your orders...");
      router.push('/profile/orders');
    } catch (error: any) {
      console.error("Error placing order:", error.message, error.code);
      setMessage(`Failed to place order: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnUrl=/cart');
    } else if (user) {
      fetchCartItems();
    }
  }, [user, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        items.forEach((item) => {
          const imageCount = item.productImageUris?.length || 1;
          if (imageCount > 1) {
            newIndices[item.id] = (prev[item.id] || 0) + 1 >= imageCount ? 0 : (prev[item.id] || 0) + 1;
          }
        });
        return newIndices;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [items]);

  const total = getTotal();
  const shipping = total > 50 ? 0 : 10;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;

  if (loading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16 font-inter">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-base sm:text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16 font-inter">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 text-sm sm:text-base mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link href="/products">
            <Button className="text-xs sm:text-sm">
              Start Shopping
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      {message && (
        <div
          className={`border px-4 py-3 rounded-lg mb-6 ${
            message.includes('successfully') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
          }`}
          role="alert"
        >
          <span className="block text-sm sm:text-base">{message}</span>
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">Cart Items ({items.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={clearCart} className="text-xs sm:text-sm">
                Clear Cart
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onDelete={openConfirmDialog}
                    imageIndex={imageIndices[item.id] || 0}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Subtotal</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `Rs.${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Tax</span>
                <span>Rs.{tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>Total</span>
                <span>Rs.{finalTotal.toFixed(2)}</span>
              </div>

              {shipping > 0 && (
                <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Add Rs.{(50 - total).toFixed(2)} more to get free shipping!
                </div>
              )}

              <Button className="w-full text-xs sm:text-sm" size="lg" onClick={handleProceedToCheckout}>
                Proceed to Checkout
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full text-xs sm:text-sm">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setDialogItem(null);
      }}>
        <DialogContent className="bg-white rounded-lg shadow-lg max-w-md p-6 font-inter">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Confirm Removal</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Are you sure you want to remove "{dialogItem?.productTitle || 'this item'}" from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setDialogItem(null);
              }}
              className="rounded-lg border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
              aria-label="Cancel removal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
              aria-label={`Confirm removal of ${dialogItem?.productTitle || 'this item'}`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-lg max-w-md p-6 font-inter">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">Proceed to Checkout?</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Do you want to continue with <strong>Cash on Delivery</strong>?
              <br />
              <span className="font-semibold text-blue-600">Other payment options coming soon!</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCheckoutDialogOpen(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
            >
              Yes, Continue with Cash on Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}