import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request);

  // Always call getUser() to refresh the session JWT via the Supabase
  // Auth server — do NOT rely on getSession() which only reads storage.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && process.env.NODE_ENV === "development") {
    console.log("[middleware] Auth check error:", error.message);
  }

  // Protect /dashboard routes — redirect to /login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[middleware] Redirecting unauthenticated user from ${request.nextUrl.pathname} to /login`
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
