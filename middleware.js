// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Check if the user is trying to access protected routes
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/Dashboard') || 
    request.nextUrl.pathname.startsWith('/admin');
  
  // If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If trying to access login page with a valid token, redirect to dashboard
  if (request.nextUrl.pathname === '/' && accessToken) {
    return NextResponse.redirect(new URL('/Dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: ['/', '/Dashboard/:path*', '/admin/:path*'],
};