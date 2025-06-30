// File: middleware.ts
// Ensure this middleware runs in Node.js runtime so jwt.verify works
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/_next', 'static', '/', 'favicon.ico']

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('authToken')?.value;
    const { pathname } = request.nextUrl;

    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) return NextResponse.next();

    // If on auth pages, redirect logged-in users
    if (pathname.startsWith('/auth')) {
        if (token) {
            try {
                // Decode only in middleware to avoid crypto dependency
                const decoded = jwt.decode(token) as { exp?: number } | null;
                if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
                    throw new Error('Token expired');
                }
            } catch {
                // ignore invalid/expired to allow re-authentication
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Protect dashboard and transaction API routes
    const protectedPaths = ['/dashboard', '/api/transactions'];
    if (protectedPaths.some(path => pathname.startsWith(path))) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        try {
            const decoded = jwt.decode(token) as { exp?: number } | null;
            if (!decoded || (decoded.exp && Date.now() >= decoded.exp * 1000)) {
                throw new Error('Invalid or expired token');
            }
            return NextResponse.next();
        } catch (error) {
            const response = NextResponse.redirect(new URL('/auth/login', request.url));
            response.cookies.delete('authToken');
            console.log('middleware token expiration error:', error);
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/auth/:path*',
        '/dashboard/:path*',
        '/api/transactions/:path*'
    ]
};