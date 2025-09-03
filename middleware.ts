import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  try {
    // Get session with error handling
    const session = await auth();

    console.log(`Admin route access attempt: ${request.nextUrl.pathname}`);
    console.log(`Session exists: ${!!session}`);
    console.log(`User role: ${session?.user?.role || 'None'}`);

    // If the user is not logged in, redirect to the login page
    if (!session?.user) {
      console.log(`Redirecting unauthenticated user from ${request.nextUrl.pathname}`);
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      console.log(`Redirecting non-admin user (${session.user.role}) from ${request.nextUrl.pathname}`);
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("error", "access_denied");
      return NextResponse.redirect(loginUrl);
    }

    console.log(`Admin access granted for ${request.nextUrl.pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, redirect to login
    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("error", "auth_error");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).)*"],
};