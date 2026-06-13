import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const protectedRoutes = [
    '/feed',
    '/profile',
    '/messages',
    '/trips',
    '/notifications',
    '/chat',
    '/connections',
    '/waves',
    '/explore',
    '/discover',
    '/settings',
    '/dashboard',
  ]

  const authRoutes = ['/sign-in', '/signup', '/forgot-password', '/confirm-email']

  // Authenticated users on auth pages → redirect to discover
  if (user && authRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/discover', request.url))
  }

  // Unauthenticated users on protected routes → redirect to sign-in
  if (!user && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Root route: authenticated → discover, unauthenticated → landing
  if (pathname === '/' && user) {
    return NextResponse.redirect(new URL('/discover', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sign-in|signup).*)'],
}
