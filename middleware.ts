import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Seller routes protection
    if (pathname.startsWith('/seller')) {
      // Allow access to seller login/register pages without authentication
      if (pathname === '/seller/login' || pathname === '/seller/register') {
        // If already authenticated as seller, redirect to dashboard
        if (token?.userType === 'seller') {
          return NextResponse.redirect(new URL('/seller/dashboard', req.url));
        }
        return NextResponse.next();
      }

      // For all other seller routes, require seller authentication
      if (!token || token.userType !== 'seller') {
        return NextResponse.redirect(new URL('/seller/login', req.url));
      }
    }

    // User routes protection
    if (pathname.startsWith('/profile') || pathname.startsWith('/cart') || pathname.startsWith('/wishlist') || pathname.startsWith('/checkout')) {
      // Redirect sellers trying to access user-only pages
      if (token?.userType === 'seller') {
        return NextResponse.redirect(new URL('/seller/dashboard', req.url));
      }
      
      // Require user authentication for these routes
      if (!token || token.userType !== 'user') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Redirect sellers from home page to dashboard
    if (pathname === '/' && token?.userType === 'seller') {
      return NextResponse.redirect(new URL('/seller/dashboard', req.url));
    }

    // Redirect to login if trying to access login page while authenticated
    if (pathname === '/login') {
      if (token?.userType === 'user') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (token?.userType === 'seller') {
        return NextResponse.redirect(new URL('/seller/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = [
          '/',
          '/login',
          '/seller/login',
          '/products',
          '/category',
          '/product',
          '/api'
        ];

        const { pathname } = req.nextUrl;
        
        // Check if it's a public route
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};