import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/prisma";

// 1. Initialize Upstash Redis & Rate Limiter
// Max 5 attempts per 60 seconds per IP address
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
});

// 2. Input Validation Schema
const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required").transform((val) => val.trim()),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    // 3. Rate Limiting Check (by IP address)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(`login_rate_limit_${ip}`);

    if (!success) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again after a minute." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    // 4. In-bound Data Validation
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, password, rememberMe } = validation.data;

    // 5. Database Query
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid User ID or Password" },
        { status: 401 }
      );
    }

    // 6. Account Status Check
    if (user.status === "CLOSED") {
      return NextResponse.json(
        { message: "Your account is closed. You cannot login." },
        { status: 403 }
      );
    }
     if (user.status === "DEACTIVATED") {
      return NextResponse.json(
        { message: "Your account is deactivated. You cannot login." },
        { status: 403 }
      );
    }


    // 7. Password Verification
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid User ID or Password" },
        { status: 401 }
      );
    }

    // 8. Secret Key Check & Expiration Config
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error("CRITICAL: JWT_SECRET environment variable is missing.");
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(secretKey);
    const jwtExpiresIn = rememberMe ? "30d" : "1d";
    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // 9. Sign JWT Token using `jose`
    const token = await new SignJWT({
      userId: user.userId,
      name: user.name,
      role: user.role,
      status: user.status,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(jwtExpiresIn)
      .sign(secret);

    // 10. Response & Set HttpOnly Cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          userId: user.userId,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: maxAgeSeconds,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login Route Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}