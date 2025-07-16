'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/product-grid';
import { useWishlist } from '@/contexts/wishlist-context';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();
  const { items, clearWishlist } = useWishlist();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?returnUrl=/wishlist');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p>Loading...</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-gray-600">{items.length} items saved</p>
        </div>
        <Button variant="outline" onClick={clearWishlist}>
          Clear Wishlist
        </Button>
      </div>

      <ProductGrid products={items} />
    </div>
  );
}