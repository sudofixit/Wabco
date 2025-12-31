import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value

  // If no session cookie, redirect to admin login
  if (!sessionToken) {
    const loginUrl = new URL("/admin-login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session exists → allow request
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
