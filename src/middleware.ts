// Importing necessary modules
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Exporting middleware function withAuth
export default withAuth(
    async function middleware(req) {
        // Extracting pathname from the request URL
        const pathName = req.nextUrl.pathname

        // Checking if the user is authenticated
        const isAuth = await getToken({ req })

        // Defining sensitive routes
        const sensitiveRoutes = ['/dashboard']

        // Checking if the user is accessing a sensitive route
        const isAccessingSensitiveRoute = sensitiveRoutes.some((route) => pathName.startsWith(route))
        
        // If the user is accessing the login page
        if (pathName.startsWith('auth')) {
            // If the user is authenticated, redirect to the dashboard
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard',req.url))
            }
            // If the user is not authenticated, proceed to the login page
            return NextResponse.next()
        }
        // If the user is not authenticated and is accessing a sensitive route, redirect to the login page
        if (!isAuth && isAccessingSensitiveRoute) {
            return NextResponse.redirect(new URL('/auth/signin', req.url))
        }

        // If the user is accessing the home page, redirect to the dashboard
        if (pathName === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }, {
        callbacks: {
            async authorized() {
                return true
            }
        }
    }
)

// Exporting config object
export const config = {
    matcher: ['/', '/auth/signin', '/dashboard/:path*']
}
