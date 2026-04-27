import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req:any) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isPublicRoute = 
    nextUrl.pathname.startsWith("/portal") || 
    nextUrl.pathname.startsWith("/api/webhook/stripe") ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/register"

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/dashboard/:path*", "/api/v1/:path*"],
}
