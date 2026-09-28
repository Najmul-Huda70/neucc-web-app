import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", req.url));
  }

  try {
    // ১. Google-এর সাথে Code এক্সচেঞ্জ করে Access Token আনা
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${new URL(req.url).origin}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || "Failed to fetch Google tokens");
    }

    // ২. Access Token দিয়ে ইউজারের Google Profile Information নেওয়া
    const userProfileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userProfileResponse.json();
    const userEmail = googleUser.email;

    // ৩. ডাটাবেজে ইমেইল দিয়ে ইউজার চেক করা
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // ডাটাবেজে না থাকলে লগইন বাতিল (কারণ শুধু রেজিস্টার্ড সদস্যরা লগইন করতে পারবে)
    if (!existingUser) {
      return NextResponse.redirect(
        new URL("/login?error=user_not_found", req.url)
      );
    }

    // একাউন্ট যদি DEACTIVATED বা DEACTIVATED থাকে
    if (existingUser.status !== "ACTIVE") {
      return NextResponse.redirect(
        new URL("/login?error=account_deactivated", req.url)
      );
    }

    // ৪. আপনার বিদ্যমান সিস্টেমে ব্যবহৃত JWT টোকেন জেনারেট করা
    const secret = process.env.JWT_SECRET || "fallback_super_secret_key";
    const token = jwt.sign(
      {
        userId: existingUser.userId,
        role: existingUser.role,
      },
      secret,
      { expiresIn: "1d" } // বা পছন্দমতো এক্সপাইরি
    );

    // ৫. কুকিতে টোকেন সেট করে Dashboard-এ রিডাইরেক্ট
    const response = NextResponse.redirect(new URL("/dashboard", req.url));

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", req.url));
  }
}