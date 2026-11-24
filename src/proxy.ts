import { NextResponse, type NextRequest } from "next/server";

/**
 * Passes the visitor's city and country (from Vercel's IP geolocation
 * headers) to the page in short-lived cookies, so the preloader can greet
 * them by place ("Good evening, Copenhagen.", with the Danish flag) without
 * making pages render dynamically.
 * Locally, or when Vercel can't place the visitor, no cookie is set.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const city = request.headers.get("x-vercel-ip-city");
  if (city) {
    // Vercel URL-encodes the header; keep it encoded in the cookie.
    response.cookies.set("visitor-city", city, {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
  }
  const country = request.headers.get("x-vercel-ip-country");
  if (country && /^[A-Za-z]{2}$/.test(country)) {
    response.cookies.set("visitor-country", country.toLowerCase(), {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });
  }
  return response;
}

export const config = {
  // Pages only: skip Next internals, API routes and static files.
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
