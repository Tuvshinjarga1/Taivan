import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // No authentication required anymore - allow all access
  return NextResponse.next();
}

// Configure the paths that will trigger this middleware
export const config = {
  matcher: [
    // Match all routes except the ones that don't need protection
    // (static files, api routes without auth, etc.)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
