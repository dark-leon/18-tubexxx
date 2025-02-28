import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Admin sahifalariga kirish
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Login sahifasiga kirish
    if (request.nextUrl.pathname === '/admin/login') {
      // Agar session mavjud bo'lsa, admin panelga yo'naltirish
      const session = request.cookies.get('auth_session');
      if (session) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      // Aks holda login sahifasini ko'rsatish
      return NextResponse.next();
    }

    // Agar session mavjud bo'lmasa, login sahifasiga yo'naltirish
    const session = request.cookies.get('auth_session');
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 