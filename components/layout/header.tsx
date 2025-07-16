'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Menu, X, Store, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { categories } from '@/lib/mock-data';
import Image from 'next/image';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { items: cartItems, getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, loading, logout } = useFirebaseAuth();

  const cartItemCount = getItemCount();
  const wishlistItemCount = wishlistItems.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user's phone number for display
  const getUserDisplayName = () => {
    if (user?.phoneNumber) {
      // Format phone number for display (e.g., +977 98XXXXXXXX -> 98XXXXXXXX)
      return user.phoneNumber.replace(/^\+977/, '').replace(/^\+/, '');
    }
    return user?.email || 'User';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo_white.png" alt="Plexify Logo" width={100} height={100} />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist */}
            {user ? (
              <Link href="/wishlist" className="relative">
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                  {wishlistItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                    >
                      {wishlistItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => router.push('/login')}>
                <Heart className="w-5 h-5" />
              </Button>
            )}

            {/* Cart */}
            {user ? (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => router.push('/login')}>
                <ShoppingCart className="w-5 h-5" />
              </Button>
            )}

            {/* User Authentication */}
            {loading ? (
              <Button variant="outline" disabled>
                Loading...
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {getUserDisplayName()}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-gray-500">
                    {user.email || user.phoneNumber}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/orders" className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Wishlist ({wishlistItemCount})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cart" className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Cart ({cartItemCount})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/seller/login" className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Become a Seller
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <MobileMenu 
                  user={user}
                  loading={loading}
                  cartItemCount={cartItemCount}
                  wishlistItemCount={wishlistItemCount}
                  onLogout={handleLogout}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 py-4 border-t">
          <Link href="/products" className="text-sm font-medium hover:text-blue-600 transition-colors">
            All Products
          </Link>
          {categories.slice(0, 6).map((category) => (
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

// Mobile Menu Component
function MobileMenu({ 
  user, 
  loading, 
  cartItemCount, 
  wishlistItemCount, 
  onLogout, 
  onClose 
}: {
  user: any;
  loading: boolean;
  cartItemCount: number;
  wishlistItemCount: number;
  onLogout: () => void;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const getUserDisplayName = () => {
    if (user?.phoneNumber) {
      return user.phoneNumber.replace(/^\+977/, '').replace(/^\+/, '');
    }
    return user?.email || 'User';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Bar - Mobile */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-b">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{getUserDisplayName()}</div>
                  <div className="text-sm text-gray-500">{user.email || user.phoneNumber}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleNavigation('/cart')}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cartItemCount})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleNavigation('/wishlist')}
                  className="flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Wishlist ({wishlistItemCount})
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => handleNavigation('/login')} 
              className="w-full"
            >
              Login
            </Button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={() => handleNavigation('/products')}
          >
            All Products
          </Button>
          {categories.slice(0, 8).map((category) => (
            <Button 
              key={category.id}
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigation(`/category/${category.slug}`)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* User Menu Items */}
        {user && (
          <div className="p-4 border-t space-y-2">
            <h3 className="font-medium text-gray-900 mb-3">Account</h3>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigation('/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigation('/profile/orders')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              My Orders
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => handleNavigation('/seller/login')}
            >
              <Store className="w-4 h-4 mr-2" />
              Become a Seller
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-600" 
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}