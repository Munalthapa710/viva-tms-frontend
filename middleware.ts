import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

 
  if (!token && pathname.startsWith("/homepage") ||
      !token && pathname.startsWith("/employee") ||
      !token && pathname.startsWith("/about")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user IS logged in and tries to access login page
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/homepage", request.url));
  }

  return NextResponse.next();
}

// Apply middleware only to these routes
export const config = {
  matcher: ["/login", "/homepage/:path*", "/employee/:path*", "/about/:path*"],
};
