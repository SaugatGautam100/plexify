'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Menu, X, Home, Store, Bell, Settings, BarChart, MessageSquare, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { categories } from '@/lib/mock-data';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  // State for the swipeable navigation bar
  const navRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse event handlers for desktop dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    if (navRef.current) {
      navRef.current.classList.add('active-dragging'); // Add class for cursor change
      navRef.current.classList.add('select-none'); // Add select-none on mouse down
      setStartX(e.pageX - navRef.current.offsetLeft);
      setScrollLeft(navRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (navRef.current) {
      navRef.current.classList.remove('active-dragging');
      navRef.current.classList.remove('select-none'); // Remove select-none on mouse leave
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (navRef.current) {
      navRef.current.classList.remove('active-dragging');
      navRef.current.classList.remove('select-none'); // Remove select-none on mouse up
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return; // Stop the function from running when mouse is not clicked
    e.preventDefault();
    if (navRef.current) {
      const x = e.pageX - navRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; // Multiplier for faster scroll
      navRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Touch event handlers for mobile swiping
  const handleTouchStart = (e) => {
    setIsDragging(true);
    if (navRef.current) {
      navRef.current.classList.add('select-none'); // Add select-none on touch start
      setStartX(e.touches[0].pageX - navRef.current.offsetLeft);
      setScrollLeft(navRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    if (navRef.current) {
      const x = e.touches[0].pageX - navRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; // Multiplier for faster scroll
      navRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (navRef.current) {
      navRef.current.classList.remove('select-none'); // Remove select-none on touch end
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <style jsx>{`
        /* Custom scrollbar hiding for Webkit browsers (Chrome, Safari) */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Custom scrollbar hiding for Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .active-dragging {
          cursor: grabbing !important;
        }
      `}</style>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              <Image src="/logo_white.png" alt="logo_black" width={100} height={100} priority />
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form className="w-full" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/wishlist" className="relative hidden md:block">
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5" />
                {wishlistItems && wishlistItems.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 rounded-full">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/cart" className="relative hidden md:block">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {cartItems && cartItems.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 rounded-full">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <div className="relative">
              {session ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline">{session.user?.name || 'Account'}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be logged out of your account. You can log back in anytime.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 pt-8">
                  <Link href="/" className="flex items-center space-x-2 text-lg font-medium hover:text-blue-600">
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </Link>
                  <Link href="/products" className="flex items-center space-x-2 text-lg font-medium hover:text-blue-600">
                    <Store className="w-5 h-5" />
                    <span>All Products</span>
                  </Link>
                  <Link href="/wishlist" className="flex items-center space-x-2 text-lg font-medium hover:text-blue-600">
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                    {wishlistItems && wishlistItems.length > 0 && (
                      <Badge variant="destructive" className="ml-auto">{wishlistItems.length}</Badge>
                    )}
                  </Link>
                  <Link href="/cart" className="flex items-center space-x-2 text-lg font-medium hover:text-blue-600">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                    {cartItems && cartItems.length > 0 && (
                      <Badge variant="destructive" className="ml-auto">{cartItems.length}</Badge>
                    )}
                  </Link>
                  {session ? (
                    <Button variant="outline" onClick={handleLogout} className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Swipeable Lower Navigation Bar */}
        <nav
          ref={navRef}
          className={`flex overflow-x-auto hide-scrollbar scroll-smooth py-4 border-t ${isDragging ? 'active-dragging select-none' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Link href="/products" className="flex-shrink-0 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md">
            All Products
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-md"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
