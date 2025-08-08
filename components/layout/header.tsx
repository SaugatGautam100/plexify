

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Heart, Menu, X, Store, LogOut, Bell, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/components/auth/firebase-auth-context';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import app from '@/app/firebaseConfig';
import { categories } from '@/lib/mock-data';
import Image from 'next/image';
import { toast as sonnerToast } from 'sonner'; // <-- IMPORT SONNER TOAST

interface UserData {
  UserName?: string;
  UserEmail?: string;
  UserPhone?: string;
  UserAddress?: string;
  UserAvatar?: string;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [countsLoading, setCountsLoading] = useState(true);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: { [itemIndex: number]: number } }>({});
  const [userProfileData, setUserProfileData] = useState<UserData>({});
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const { user, userData, loading, logout } = useFirebaseAuth();
  const { toast } = useToast(); // Keep for other potential toasts if needed

  // ... (useEffect for fetching user data remains the same) ...

  useEffect(() => {
    if (loading || !user) {
      setUserProfileData({});
      return;
    }
    const db = getDatabase(app);
    const userRef = ref(db, `AllUsers/Users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserProfileData({
          UserName: data.UserName || '',
          UserEmail: data.UserEmail || user.email || '',
          UserPhone: data.UserPhone || user.phoneNumber || '',
          UserAddress: data.UserAddress || '',
          UserAvatar: data.UserAvatar || '',
        });
      } else {
        setUserProfileData({ UserName: '', UserEmail: user.email || '', UserPhone: user.phoneNumber || '', UserAddress: '', UserAvatar: '' });
      }
    });
    return () => off(userRef, 'value', unsubscribe);
  }, [user, loading]);


  // ... (useEffect for fetching counts remains the same) ...

  useEffect(() => {
    if (loading || !user) {
      setCartItemCount(0);
      setWishlistItemCount(0);
      setUnreadNotificationCount(0);
      setRecentNotifications([]);
      setCountsLoading(false);
      return;
    }
    setCountsLoading(true);
    const db = getDatabase(app);
    const cartRef = ref(db, `AllUsers/Users/${user.uid}/UserCartItems`);
    const wishlistRef = ref(db, `AllUsers/Users/${user.uid}/UserWishlistItems`);
    const notificationsRef = ref(db, `AllUsers/Users/${user.uid}/UserNotifications`);
    
    const unsubscribeCart = onValue(cartRef, (snapshot) => {
      setCartItemCount(snapshot.exists() ? Object.values(snapshot.val()).reduce((sum: number, item: any) => sum + (item.productQuantity || 0), 0) : 0);
      setCountsLoading(false);
    });
    const unsubscribeWishlist = onValue(wishlistRef, (snapshot) => {
      setWishlistItemCount(snapshot.exists() ? Object.keys(snapshot.val()).length : 0);
    });
    const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
      let unreadCount = 0;
      const notifications: any[] = [];
      if (snapshot.exists()) {
        Object.keys(snapshot.val()).forEach(key => {
          const notification = { id: key, ...snapshot.val()[key] };
          notifications.push(notification);
          if (!notification.read) unreadCount++;
        });
        notifications.sort((a, b) => b.timestamp - a.timestamp);
      }
      setUnreadNotificationCount(unreadCount);
      setRecentNotifications(notifications.slice(0, 5));
    });

    return () => {
      off(cartRef, 'value', unsubscribeCart);
      off(wishlistRef, 'value', unsubscribeWishlist);
      off(notificationsRef, 'value', unsubscribeNotifications);
    };
  }, [user, loading]);


  // ... (useEffect for image carousel remains the same) ...
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices((prev) => {
        const newIndices = { ...prev };
        recentNotifications.forEach((notification) => {
          const items = parseNotificationItems(notification.message);
          newIndices[notification.id] = newIndices[notification.id] || {};
          items.forEach((item, itemIndex) => {
            const imageCount = item.images?.length || 1;
            if (imageCount > 1) {
              newIndices[notification.id][itemIndex] = ((prev[notification.id]?.[itemIndex] || 0) + 1) % imageCount;
            }
          });
        });
        return newIndices;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [recentNotifications]);

  // ... (parseNotificationItems and handleSearch remain the same) ...
  const parseNotificationItems = (message: string) => {
    const itemLines = message.split('\n').filter(line => line.startsWith('- '));
    return itemLines.map(line => {
     const match = line.match(/- Title: (.+); Price: Rs\.([\d.]+); Quantity: (\d+); Category: (.+); Unit: (.+); Type: (.+); Images: \[([^\]]*)\]/);
      if (match) {
        const images = match[7].split(',').map(url => url.trim()).filter(url => url);
        return {
          title: match[1],
          price: parseFloat(match[2]),
          quantity: parseInt(match[3]),
          images: images.length > 0 ? images : ['https://placehold.co/100x100/E0E0E0/808080?text=No+Image'],
        };
      }
      return null;
    }).filter(item => item !== null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };


  /**
   * Handles user logout with Sonner toast notifications.
   */
  const handleLogout = async () => {
    setLogoutDialogOpen(false); // Close dialog first
    try {
      await logout();
      sonnerToast.success('You have been successfully logged out.'); // <-- USE SONNER
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      sonnerToast.error('Failed to log out. Please try again.'); // <-- USE SONNER
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    return userProfileData?.UserName || 'User';
  };

  const getUserContactInfo = () => {
    if (!user) return '';
    return userProfileData.UserPhone || userProfileData.UserEmail || '';
  };

  return (
    <>
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
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={countsLoading} className="relative">
                      <Bell className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                      {unreadNotificationCount > 0 && !countsLoading && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0">{unreadNotificationCount}</Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                    <DropdownMenuItem asChild>
                      <Link href="/profile/notifications" className="w-full text-center py-2 text-blue-600 hover:text-blue-700 font-semibold">View All Notifications</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-4 py-2 text-sm font-bold border-b">Recent Notifications</div>
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map(notification => (
                        <DropdownMenuItem key={notification.id} asChild>
                          <Link href="/profile/notifications" className="flex flex-col items-start p-2">
                            <span className={`text-sm ${notification.read ? 'text-gray-500' : 'font-semibold text-gray-900'}`}>{notification.title}</span>
                            {parseNotificationItems(notification.message).map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center gap-2 mt-1">
                                <img src={item.images[imageIndices[notification.id]?.[itemIndex] || 0]} alt={item.title} className="w-8 h-8 object-cover rounded" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/E0E0E0/808080?text=No+Image')} />
                                <div>
                                  <span className="text-xs text-gray-600">{item.title}</span>
                                  <span className="text-xs text-gray-600 block">Rs.{item.price.toFixed(2)} x {item.quantity}</span>
                                </div>
                              </div>
                            ))}
                            <span className="text-xs text-gray-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem className="text-gray-500 text-sm py-4">No new notifications.</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => router.push('/login')}><Bell className="w-5 h-5 text-gray-600 hover:text-blue-600" /></Button>
              )}

              {/* Wishlist */}
              <Link href={user ? "/wishlist" : "/login"} className="relative">
                <Button variant="ghost" size="icon" disabled={user && countsLoading}>
                  <Heart className="w-5 h-5" />
                  {user && wishlistItemCount > 0 && !countsLoading && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0">{wishlistItemCount}</Badge>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Link href={user ? "/cart" : "/login"} className="relative">
                <Button variant="ghost" size="icon" disabled={user && countsLoading}>
                  <ShoppingCart className="w-5 h-5" />
                  {user && cartItemCount > 0 && !countsLoading && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0">{cartItemCount}</Badge>
                  )}
                </Button>
              </Link>

              {/* User Auth */}
              {loading ? (
                <Button variant="outline" disabled>Loading...</Button>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{getUserDisplayName()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">{getUserDisplayName()}</div>
                    <div className="px-2 py-1.5 text-xs text-gray-500">{getUserContactInfo()}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/profile" className="flex items-center gap-2"><User className="w-4 h-4" />Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/profile/orders" className="flex items-center gap-2"><Package className="w-4 h-4" />My Orders</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/wishlist" className="flex items-center gap-2"><Heart className="w-4 h-4" />Wishlist ({wishlistItemCount})</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/cart" className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Cart ({cartItemCount})</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)} className="flex items-center gap-2 text-red-600 focus:text-red-600"><LogOut className="w-4 h-4" />Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login"><Button variant="outline">Login</Button></Link>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu className="w-5 h-5" /></Button></SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm">
                  <MobileMenu user={user} userData={userProfileData} loading={loading} cartItemCount={cartItemCount} wishlistItemCount={wishlistItemCount} notificationCount={unreadNotificationCount} onLogout={() => setLogoutDialogOpen(true)} onClose={() => setIsMobileMenuOpen(false)} getUserDisplayName={getUserDisplayName} getUserContactInfo={getUserContactInfo} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8 py-4 border-t">
            <Link href="/products" className="text-sm font-medium hover:text-blue-600 transition-colors">All Products</Link>
            {categories.slice(0, 7).map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="text-sm font-medium hover:text-blue-600 transition-colors">{category.name}</Link>
            ))}
          </nav>
        </div>
      </header>
      
      {/* LOGOUT CONFIRMATION DIALOG */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-lg max-w-md p-6 font-inter">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Confirm Logout</DialogTitle>
            <DialogDescription className="text-gray-600">Are you sure you want to log out?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)} className="rounded-lg border-gray-300 hover:bg-gray-50">Cancel</Button>
            <Button onClick={handleLogout} className="rounded-lg bg-red-600 hover:bg-red-700 text-white">Confirm Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ... (MobileMenu component remains the same) ...
interface MobileMenuProps {
  user: any;
  userData: UserData;
  loading: boolean;
  cartItemCount: number;
  wishlistItemCount: number;
  notificationCount: number;
  onLogout: () => void;
  onClose: () => void;
  getUserDisplayName: () => string;
  getUserContactInfo: () => string;
}

function MobileMenu({
  user,
  userData,
  loading,
  cartItemCount,
  wishlistItemCount,
  notificationCount,
  onLogout,
  onClose,
  getUserDisplayName,
  getUserContactInfo
}: MobileMenuProps) {
  const router = useRouter();
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
      onClose();
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search Bar - Mobile */}
        <div className="p-4 border-b">
          <form onSubmit={handleMobileSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input type="text" placeholder="Search products..." value={mobileSearchQuery} onChange={(e) => setMobileSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 w-full" />
          </form>
        </div>

        {/* User Section */}
        <div className="p-4 border-b">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : user ? (
            <div className="space-y-3">
              <Link href="/profile">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <div className="font-medium">{getUserDisplayName()}</div>
                    <div className="text-sm text-gray-500">{getUserContactInfo()}</div>
                  </div>
                </div>
              </Link>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start relative" onClick={() => handleNavigation('/profile/notifications')}>
                  <Bell className="w-4 h-4 text-gray-600 hover:text-blue-600 mr-2" />Notifications
                  {notificationCount > 0 && <Badge variant="destructive" className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center text-xs p-0">{notificationCount}</Badge>}
                </Button>
                <Button variant="outline" className="w-full justify-start relative" onClick={() => handleNavigation('/cart')}>
                  <ShoppingCart className="w-4 h-4 mr-2" />Cart
                  {cartItemCount > 0 && <Badge variant="destructive" className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center text-xs p-0">{cartItemCount}</Badge>}
                </Button>
                <Button variant="outline" className="w-full justify-start relative" onClick={() => handleNavigation('/wishlist')}>
                  <Heart className="w-4 h-4 mr-2" />Wishlist
                  {wishlistItemCount > 0 && <Badge variant="destructive" className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center text-xs p-0">{wishlistItemCount}</Badge>}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => handleNavigation('/login')} className="w-full">Login</Button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/products')}>All Products</Button>
          {categories.slice(0, 8).map((category) => (
            <Button key={category.id} variant="ghost" className="w-full justify-start" onClick={() => handleNavigation(`/category/${category.slug}`)}>{category.name}</Button>
          ))}
        </div>

        {/* User Menu Items */}
        {user && (
          <div className="p-4 border-t space-y-2">
            <h3 className="font-medium text-gray-900 mb-3">Account</h3>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/profile')}><User className="w-4 h-4 mr-2" />Profile</Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigation('/profile/orders')}><Package className="w-4 h-4 mr-2" />My Orders</Button>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600" onClick={() => { onLogout(); onClose(); }}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}