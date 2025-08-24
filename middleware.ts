import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        const { pathname } = req.nextUrl
        
        // Allow access to auth pages without authentication
        if (pathname.startsWith('/auth')) {
          return true
        }
        
        // Protect dashboard and profile routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/auth/:path*']
}