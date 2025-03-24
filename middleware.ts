import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const res = NextResponse.next();

  res.headers.set(
    "Content-Security-Policy",
    "img-src 'self' blob: data: *.supabase.co"
  );

  // Пути, не требующие авторизации
  const publicPaths = ['/auth/login', '/auth/registration'];
  
  if (!token && !publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}