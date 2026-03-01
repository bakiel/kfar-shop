import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/admin', '/vendor/dashboard', '/vendor/orders', '/vendor/products', '/vendor/promotions', '/vendor/qr-codes', '/vendor/marketing', '/vendor/settings', '/vendor/admin', '/customer/dashboard', '/customer/orders', '/customer/rewards', '/customer/profile', '/customer/favorites', '/customer/qr'];

// Routes that are always public (login/register pages)
const PUBLIC_ROUTES = ['/admin/login', '/vendor/login', '/vendor/onboarding', '/customer/login', '/customer/register', '/customer/onboarding', '/customer/join', '/customer/welcome'];

// API routes that don't need auth
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/products', '/api/vendors', '/api/landing', '/api/search'];

function isProtectedRoute(pathname: string): boolean {
  // Public routes are never protected
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return false;
  // Check if matches a protected prefix
  return PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(r => pathname.startsWith(r));
}

// Determine required role from path
function getRequiredRole(pathname: string): string | null {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/vendor/dashboard') || pathname.startsWith('/vendor/orders') || pathname.startsWith('/vendor/products') || pathname.startsWith('/vendor/promotions') || pathname.startsWith('/vendor/qr-codes') || pathname.startsWith('/vendor/marketing') || pathname.startsWith('/vendor/settings') || pathname.startsWith('/vendor/admin')) return 'vendor';
  if (pathname.startsWith('/customer/dashboard') || pathname.startsWith('/customer/orders') || pathname.startsWith('/customer/rewards') || pathname.startsWith('/customer/profile') || pathname.startsWith('/customer/favorites') || pathname.startsWith('/customer/qr')) return 'customer';
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block test/debug API routes in production
  if (
    process.env.NODE_ENV !== 'development' &&
    (pathname.startsWith('/api/test-') || pathname.startsWith('/api/debug'))
  ) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Skip non-protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // For API routes, check Authorization header
  if (pathname.startsWith('/api/')) {
    if (isPublicApiRoute(pathname)) return NextResponse.next();

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Token validation happens in the API route itself (middleware can't do async JWT verify)
    return NextResponse.next();
  }

  // For page routes, check for refresh token cookie (presence check only)
  // Actual JWT validation happens client-side via AuthContext
  const refreshToken = request.cookies.get('refreshToken');
  if (!refreshToken) {
    const requiredRole = getRequiredRole(pathname);
    const loginPath = requiredRole === 'admin' ? '/admin/login' :
                      requiredRole === 'vendor' ? '/vendor/login' :
                      '/customer/login';
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/dashboard/:path*',
    '/vendor/orders/:path*',
    '/vendor/products/:path*',
    '/vendor/promotions/:path*',
    '/vendor/qr-codes/:path*',
    '/vendor/marketing/:path*',
    '/vendor/settings/:path*',
    '/vendor/admin/:path*',
    '/customer/dashboard/:path*',
    '/customer/orders/:path*',
    '/customer/rewards/:path*',
    '/customer/profile/:path*',
    '/customer/favorites/:path*',
    '/customer/qr/:path*',
    '/api/admin/:path*',
    '/api/vendor/:path*',
    '/api/customer/:path*',
    '/api/test-(.*)',
    '/api/debug(.*)',
  ],
};
