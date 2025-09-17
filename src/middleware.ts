import { NextRequest, NextResponse } from 'next/server'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import { runWithAmplifyServerContext } from '@/utils/authServerUtils'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname
  
  try {
    // Check authentication using the official AWS Amplify pattern
    const authenticated = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const session = await fetchAuthSession(contextSpec, {})
          return session.tokens !== undefined
        } catch (error) {
          console.log('Authentication check failed:', error)
          return false
        }
      },
    })
    
    // Define protected routes that require authentication
    const protectedRoutes = ['/feed', '/profile', '/messages', '/trips', '/notifications']
    
    // Define auth routes that should redirect authenticated users away
    const authRoutes = ['/sign-in', '/signup']
    
    // If user is authenticated and tries to access auth routes, redirect to feed
    if (authenticated && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/feed', request.url))
    }
    
    // If user is not authenticated and tries to access protected routes, redirect to sign-in
    if (!authenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
    
    // Special handling for root route
    if (pathname === '/') {
      if (authenticated) {
        return NextResponse.redirect(new URL('/feed', request.url))
      }
      // Let non-authenticated users see the landing page
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to proceed
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sign-in (authentication page)
     * - signup (authentication page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sign-in|signup).*)',
  ],
}