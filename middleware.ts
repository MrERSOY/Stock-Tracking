import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece temel route yönlendirmesi yap
  // Ana sayfa için kontrol
  if (pathname === "/") {
    // Session kontrolü server component'lerde yapılacak
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // Sadece ana sayfa
};
