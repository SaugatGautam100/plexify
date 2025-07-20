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
import { getDatabase, ref, get, remove, push, set } from 'firebase/database'; // Added push and set
import { getAuth } from 'firebase/auth'; // Added getAuth
import app from '../firebaseConfig';

/**
 * CartPage component displays the user's shopping cart, fetching items from Firebase Realtime Database.
 * It includes a responsive layout with cart items, an order summary, and an image carousel for items.
 * A confirmation dialog is shown before deleting an item.
 */
export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();
  const [items, setItems] = useState<Array<{ id: string; productPrice: number; productQuantity: number; productTitle: string; productImageUris?: string[]; productCategory: string; productStock: number; productUnit: string; productType: string; adminUid: string; productRandomId?: string }>>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false); // For item deletion confirmation
  const [dialogItem, setDialogItem] = useState<{ id: string; productTitle: string } | null>(null);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false); // For checkout confirmation

  /**
   * Fetches cart items from Firebase Realtime Database for the authenticated user.
   */
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
    } catch (error) {
      console.error("Error fetching cart items:", error.message, error.code);
      setItems([]);
      setImageIndices({});
      setMessage(`Failed to load cart: ${error.message}`);
    } finally {
      setCartLoading(false);
    }
  };

  /**
   * Calculates the total cost of items in the cart.
   */
  const getTotal = () => {
    return items.reduce((sum, item) => sum + (item.productPrice * item.productQuantity || 0), 0);
  };

  /**
   * Clears all items from the user's cart in Firebase.
   */
  const clearCart = async () => {
    if (!user) return;

    try {
      const db = getDatabase(app);
      const cartRef = ref(db, `AllUsers/Users/${user.uid}/UserCartItems`);
      await remove(cartRef);
      setItems([]);
      setImageIndices({});
      setMessage('Cart cleared successfully!');
    } catch (error) {
      console.error("Error clearing cart:", error.message, error.code);
      setMessage(`Failed to clear cart: ${error.message}`);
    }
  };

  /**
   * Deletes a single item from the user's cart in Firebase.
   * @param id - The Firebase key of the cart item
   * @param productTitle - The title of the product for feedback
   */
  const handleDeleteFromCart = async (id: string, productTitle: string) => {
    if (!user) {
      setMessage('Please log in to remove items from your cart.');
      return;
    }

    try {
      const db = getDatabase(app);
      const itemRef = ref(db, `AllUsers/Users/${user.uid}/UserCartItems/${id}`);
      await remove(itemRef);
      setItems((prevItems) => {
        const newItems = prevItems.filter((item) => item.id !== id);
        console.log("Updated items after deletion:", newItems);
        return newItems;
      });
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        delete newIndices[id];
        return newIndices;
      });
      setMessage(`"${productTitle}" removed from cart successfully!`);
      await fetchCartItems(); // Sync UI with Firebase
    } catch (error) {
      console.error("Error removing item from cart:", error.message, error.code);
      setMessage(`Failed to remove "${productTitle}" from cart: ${error.message}`);
    }
  };

  /**
   * Opens the confirmation dialog for deleting a cart item.
   * @param id - The Firebase key of the cart item
   * @param productTitle - The title of the product for the dialog message
   */
  const openConfirmDialog = (id: string, productTitle: string) => {
    console.log("Opening confirm dialog:", { id, productTitle });
    if (!id || !productTitle) {
      console.error("Invalid id or productTitle:", { id, productTitle });
      setMessage("Unable to remove item: Invalid data.");
      return;
    }
    setDialogItem({ id, productTitle });
    setDialogOpen(true);
    console.log("Dialog state set:", { dialogOpen: true, dialogItem: { id, productTitle } });
  };

  /**
   * Handles confirmation of deletion and closes the dialog.
   */
  const handleConfirmDelete = () => {
    console.log("Confirm delete called:", dialogItem);
    if (dialogItem) {
      handleDeleteFromCart(dialogItem.id, dialogItem.productTitle);
    }
    setDialogOpen(false);
    setDialogItem(null);
  };

  /**
   * Handles the "Proceed to Checkout" button click, opening the checkout confirmation dialog.
   */
  const handleProceedToCheckout = () => {
    setCheckoutDialogOpen(true);
  };

  /**
   * Handles the confirmation of checkout (Cash on Delivery).
   * Saves the order to Firebase and clears the cart.
   */
  const handleConfirmCheckout = async () => {
    setCheckoutDialogOpen(false); // Close the checkout dialog
    setMessage(''); // Clear any previous messages

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
      const auth = getAuth(app); // Get auth instance
      const currentUser = auth.currentUser; // Get current user

      if (!currentUser) {
        setMessage("Authentication error. Please log in again.");
        return;
      }

      const orderRefUser = ref(db, `AllUsers/Users/${currentUser.uid}/UserOrders`);
      const orderRefAdmin = ref(db, `Admins/AllUserOrders`);

      // Generate a unique key for the new order
      const newOrderRef = push(orderRefUser); // Use push to get a unique ID
      const orderId = newOrderRef.key;

      const orderData = {
        orderId: orderId,
        userId: currentUser.uid,
        userEmail: currentUser.email || 'N/A', // Include user email
        orderNumber: `ORD-${Date.now()}`, // Simple order number
        createdAt: Date.now(),
        paymentMethod: 'Cash on Delivery',
        status: 'pending', // Initial status
        items: items.map(item => ({
          productId: item.id,
          productTitle: item.productTitle,
          productPrice: item.productPrice,
          productQuantity: item.productQuantity,
          productImage: item.productImageUris && item.productImageUris.length > 0 ? item.productImageUris[0] : 'https://placehold.co/100x100/E0E0E0/808080?text=No+Image',
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

      // Save order to user's orders
      await set(newOrderRef, orderData);

      // Save order to admin's all orders
      await set(ref(db, `Admins/AllUserOrders/${orderId}`), orderData);

      // Clear the user's cart after successful order placement
      await clearCart();
      setMessage("Order placed successfully! Redirecting to your orders...");
      router.push('/profile/orders'); // Redirect to orders page
    } catch (error) {
      console.error("Error placing order:", error.message, error.code);
      setMessage(`Failed to place order: ${error.message}`);
    }
  };


  // Fetch cart items when user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnUrl=/cart');
    } else if (user) {
      fetchCartItems();
    }
  }, [user, loading, router]);

  // Automatic carousel cycling for cart items
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
    }, 1500); // Change image every 1.5 seconds

    return () => clearInterval(interval);
  }, [items]);

  const total = getTotal();
  const shipping = total > 50 ? 0 : 10;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;

  if (loading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-16 font-inter">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 font-inter">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link href="/products">
            <Button>
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
          className={`border px-4 py-3 rounded-lg relative mb-6 ${
            message.includes('successfully') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
          }`}
          role="alert"
        >
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cart Items ({items.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={clearCart}>
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

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `Rs.${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Rs.{tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>Rs.{finalTotal.toFixed(2)}</span>
              </div>

              {shipping > 0 && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Add Rs.{(50 - total).toFixed(2)} more to get free shipping!
                </div>
              )}

              {/* Modified to open checkout dialog */}
              <Button className="w-full" size="lg" onClick={handleProceedToCheckout}>
                Proceed to Checkout
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for item deletion confirmation */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        console.log("Dialog open state changed:", open);
        setDialogOpen(open);
        if (!open) setDialogItem(null);
      }}>
        <DialogContent className="bg-white rounded-lg shadow-lg max-w-md p-6 font-inter">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Confirm Removal</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove "{dialogItem?.productTitle || 'this item'}" from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                console.log("Cancel button clicked");
                setDialogOpen(false);
                setDialogItem(null);
              }}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
              aria-label="Cancel removal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
              aria-label={`Confirm removal of ${dialogItem?.productTitle || 'this item'}`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Dialog for checkout confirmation */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-lg max-w-md p-6 font-inter">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Proceed to Checkout?</DialogTitle>
            <DialogDescription className="text-gray-600">
              Do you want to continue with **Cash on Delivery**?
              <br />
              <span className="font-semibold text-blue-600">Other payment options coming soon!</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCheckoutDialogOpen(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Yes, Continue with Cash on Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
