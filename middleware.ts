import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    
    // If the user is not logged in, redirect to the login page
    if (!session?.user) {
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin-login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If there's an error, redirect to login
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"]
};