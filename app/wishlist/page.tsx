
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, get, remove } from 'firebase/database';
import app from '../firebaseConfig';

/**
 * WishlistPage component displays the user's wishlist, fetching items from Firebase Realtime Database.
 * It includes a responsive layout with product cards matching ProductsPage design, with a delete button for each item.
 * A styled confirmation dialog is shown before deleting an item.
 */
export default function WishlistPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();
  const [items, setItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});
  const [message, setMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogItem, setDialogItem] = useState<{ wishlistItemId: string; productTitle: string } | null>(null);

  /**
   * Fetches wishlist items from Firebase Realtime Database for the authenticated user.
   * Includes wishlistItemId (Firebase key) for deletion.
   */
  const fetchWishlistItems = async () => {
    if (!user) return;

    setWishlistLoading(true);
    setMessage('');
    try {
      const db = getDatabase(app);
      const wishlistRef = ref(db, `AllUsers/Users/${user.uid}/UserWishlistItems`);
      const snapshot = await get(wishlistRef);

      if (snapshot.exists()) {
        const wishlistData = snapshot.val();
        const wishlistItems = Object.keys(wishlistData).map((key) => ({
          ...wishlistData[key],
          productId: wishlistData[key].productId,
          wishlistItemId: key
        }));
        setItems(wishlistItems);
        setImageIndices(wishlistItems.reduce((acc, item) => ({
          ...acc,
          [item.productId]: 0
        }), {}));
      } else {
        setItems([]);
        setImageIndices({});
      }
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      setItems([]);
      setImageIndices({});
      setMessage(`Failed to load wishlist: ${error.message}`);
    } finally {
      setWishlistLoading(false);
    }
  };

  /**
   * Clears all items from the user's wishlist in Firebase.
   */
  const clearWishlist = async () => {
    if (!user) return;

    try {
      const db = getDatabase(app);
      const wishlistRef = ref(db, `AllUsers/Users/${user.uid}/UserWishlistItems`);
      await remove(wishlistRef);
      setItems([]);
      setImageIndices({});
      setMessage('Wishlist cleared successfully!');
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      setMessage(`Failed to clear wishlist: ${error.message}`);
    }
  };

  /**
   * Deletes a single item from the user's wishlist in Firebase.
   * @param wishlistItemId - The Firebase key of the wishlist item
   * @param productTitle - The title of the product for feedback
   */
  const handleDeleteFromWishlist = async (wishlistItemId, productTitle) => {
    if (!user) {
      setMessage('Please log in to remove items from your wishlist.');
      return;
    }

    try {
      const db = getDatabase(app);
      const itemRef = ref(db, `AllUsers/Users/${user.uid}/UserWishlistItems/${wishlistItemId}`);
      await remove(itemRef);
      setItems((prevItems) => prevItems.filter((item) => item.wishlistItemId !== wishlistItemId));
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        delete newIndices[wishlistItemId];
        return newIndices;
      });
      setMessage(`"${productTitle}" removed from wishlist successfully!`);
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      setMessage(`Failed to remove "${productTitle}" from wishlist: ${error.message}`);
    }
  };

  /**
   * Opens the confirmation dialog for deleting a wishlist item.
   * @param wishlistItemId - The Firebase key of the wishlist item
   * @param productTitle - The title of the product for the dialog message
   */
  const openConfirmDialog = (wishlistItemId, productTitle) => {
    setDialogItem({ wishlistItemId, productTitle });
    setDialogOpen(true);
  };

  /**
   * Handles confirmation of deletion and closes the dialog.
   */
  const handleConfirmDelete = () => {
    if (dialogItem) {
      handleDeleteFromWishlist(dialogItem.wishlistItemId, dialogItem.productTitle);
    }
    setDialogOpen(false);
    setDialogItem(null);
  };

  // Automatic carousel cycling for wishlist items
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices(prev => {
        const newIndices = { ...prev };
        items.forEach(item => {
          const imageCount = item.productImageUris?.length || 1;
          if (imageCount > 1) {
            newIndices[item.productId] = (prev[item.productId] || 0) + 1 >= imageCount ? 0 : (prev[item.productId] || 0) + 1;
          }
        });
        return newIndices;
      });
    }, 1500); // Change image every 1.5 seconds

    return () => clearInterval(interval);
  }, [items]);

  // Fetch wishlist items when user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnUrl=/wishlist');
    } else if (user) {
      fetchWishlistItems();
    }
  }, [user, loading, router]);

  if (loading || wishlistLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-8">
            Save items you love for later by clicking the heart icon.
          </p>
          <Link href="/products">
            <Button>
              <ShoppingBag className="mr-2 w-4 h-4" />
              Start Shopping
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-600">{items.length} items saved</p>
        </div>
        <Button variant="outline" onClick={clearWishlist}>
          Clear Wishlist
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.productId} className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <Link href={`/product/${item.productId}`} className="block">
              <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
                {item.productImageUris && item.productImageUris.length > 0 ? (
                  <>
                    <Image
                      src={item.productImageUris[imageIndices[item.productId] || 0]}
                      alt={`${item.productTitle || "Product Image"} ${imageIndices[item.productId] + 1}`}
                      fill
                      className="object-contain transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/E0E0E0/808080?text=Image+Error";
                      }}
                    />
                    {item.productImageUris.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                        {imageIndices[item.productId] + 1} / {item.productImageUris.length}
                      </div>
                    )}
                  </>
                ) : (
                  <Image
                    src="https://placehold.co/600x400/E0E0E0/808080?text=No+Image"
                    alt="No Image Available"
                    fill
                    className="object-contain transition-transform duration-300 hover:scale-105"
                  />
                )}
              </div>
              <CardContent className="p-4 relative">
                <h2 className="mb-1 text-lg font-semibold text-gray-800 truncate">{item.productTitle}</h2>
                <p className="text-sm text-gray-600">{item.productCategory}</p>
                <p className="text-sm text-gray-600">Available: {item.productStock}</p>
                <div className="mt-2 text-xl font-bold text-blue-900">
                  Rs.{item.productPrice}{' '}
                  <span className="text-sm text-gray-500">per {item.productUnit}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full border-gray-300 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    openConfirmDialog(item.wishlistItemId, item.productTitle);
                  }}
                  aria-label={`Remove ${item.productTitle} from wishlist`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-lg max-w-md p-6 font-inter">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Confirm Removal</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove "{dialogItem?.productTitle}" from your wishlist?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
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
              aria-label={`Confirm removal of ${dialogItem?.productTitle}`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
