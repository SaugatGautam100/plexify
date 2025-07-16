import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/cart-context';
import { AuthProvider } from '@/contexts/auth-context';
import { WishlistProvider } from '@/contexts/wishlist-context';
import { SellerProvider } from '@/contexts/seller-context';
import { FirebaseAuthProvider } from '@/components/auth/firebase-auth-context';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SessionWrapper from '@/contexts/SessionWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plexify - Your Online Shopping Destination for Plex Number of Products with Quality and Value',
  description: 'Discover quality products at great prices. Shop electronics, fashion, home & garden, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseAuthProvider>
          <AuthProvider>
            <SellerProvider>
              <CartProvider>
                <WishlistProvider>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">
                      <SessionWrapper>

                      {children}
                      </SessionWrapper>
                    </main>
                    <Footer />
                  </div>
                  <Toaster />
                </WishlistProvider>
              </CartProvider>
            </SellerProvider>
          </AuthProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}