'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import Link from 'next/link';
import { useSession } from 'next-auth/react';


export default function AccountPage() {
 
  const { getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const router = useRouter();
    const { data: session, status } = useSession();

 
  const cartItemCount = getItemCount();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">{session?.user?.name}</p>
              <p className="text-gray-600 mb-4">Total orders placed</p>
              <Link href="/account/orders">
                <Button variant="outline" className="w-full">
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Wishlist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Wishlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">{wishlistItems.length}</p>
              <p className="text-gray-600 mb-4">Items saved</p>
              <Link href="/wishlist">
                <Button variant="outline" className="w-full">
                  View Wishlist
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-2">{cartItemCount}</p>
              <p className="text-gray-600 mb-4">Items in cart</p>
              <Link href="/cart">
                <Button variant="outline" className="w-full">
                  View Cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="text-gray-600">{session?.user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-gray-600">{session?.user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Addresses</h3>
                {/* {user.addresses.length > 0 ? (
                  <div className="space-y-2">
                    {user.addresses.map((address) => (
                      <div key={address.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{address.name}</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No addresses saved</p>
                )} */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}