'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Menu, X, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useSeller } from '@/contexts/seller-context';
import { categories } from '@/lib/mock-data';
import { useSession } from 'next-auth/react';
import { signOut } from "next-auth/react";



export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getItemCount } = useCart();
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { seller, logout: sellerLogout } = useSeller();
  const router = useRouter();

  const cartItemCount = getItemCount();

  const { data: session, status } = useSession();

  console.log("Session:", session);
  console.log("Status:", status);

  const isLoadingSession = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isUnauthenticated = status === "unauthenticated";


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after submitting
    }
  };

  const handleLogout = () => {
    logout();
    sellerLogout();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Plexify</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Seller Portal Link */}
            

            {/* Seller Dashboard Link */}
            
              {isAuthenticated ? (
                   <div>
                </div>
              ) : (
                <div>
                  {!seller && (
              <Link href="/seller/login" className="hidden md:flex">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Store className="w-4 h-4 mr-2" />
                  Sell on Plexify
                </Button>
              </Link>
            )}

                {seller && (

                <Link href="/seller/dashboard" className="hidden md:flex">
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                  <Store className="w-4 h-4 mr-2" />
                  Seller Dashboard
                </Button>
              </Link>
                )}
                </div>
              )}
            

            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <div className="relative">

              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  
                  <Link href={"/profile"}>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}

            </div>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-4">
                  <div className="mb-4">
                    <form onSubmit={handleSearch} className="w-full">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </form>
                  </div>

                  {/* Seller Portal Link - Mobile */}
                  {!seller && (
                    <Link href="/seller/login" className="text-lg font-medium hover:text-blue-600">
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Sell on Plexify
                      </div>
                    </Link>
                  )}

                  {/* Seller Dashboard Link - Mobile */}
                  {seller && (
                    <Link href="/seller/dashboard" className="text-lg font-medium hover:text-green-600">
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5" />
                        Seller Dashboard
                      </div>
                    </Link>
                  )}

                  <Link href="/products" className="text-lg font-medium hover:text-blue-600">
                    All Products
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="text-lg font-medium hover:text-blue-600"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8 py-4 border-t">
          <Link href="/products" className="text-sm font-medium hover:text-blue-600 transition-colors">
            All Products
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}