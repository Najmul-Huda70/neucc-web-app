import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Routes config
const PRIVATE_PATH_PREFIX = "/dashboard";
const ADMIN_ONLY_PATH = "/dashboard/committees";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ⚠️ ১. স্ক্রিনশট অনুযায়ী আপনার কূকির নাম "token" (accessToken নয়)
  const token = req.cookies.get("token")?.value;

  // ২. ইউজার লগইন থাকলে তাকে /login পেজে ঢুকতে না দিয়ে ড্যাশবোর্ডে রিডাইরেক্ট করবে
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ৩. Check if route is private (/dashboard*)
  if (pathname.startsWith(PRIVATE_PATH_PREFIX)) {
    // Token না থাকলে সরাসরি Login পেজে রিডাইরেক্ট
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // ৪. Verify JWT Token using 'jose'
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "your-secret-key"
      );

      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as string; // 'ADMIN' | 'MODARATOR' | 'MEMBER'

      // ৫. Admin-only Route Access Control (/dashboard/committees)
      if (pathname.startsWith(ADMIN_ONLY_PATH)) {
        if (userRole !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      // ৬. Authorization success, proceed
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware Auth Error:", error);
      // Expired বা Invalid Token হলে Login পেজে পাঠাবে
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 🌐 Matcher config for Next.js Middleware
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};