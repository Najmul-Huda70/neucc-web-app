import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const userId = body?.userId;
    const otp = body?.otp;

    if (!userId || !otp || typeof userId !== "string" || typeof otp !== "string") {
      return NextResponse.json(
        { message: "User ID and OTP are required" },
        { status: 400 }
      );
    }

    const cleanUserId = userId.trim().toUpperCase();
    const cleanOtp = otp.trim();

    const user = await prisma.user.findUnique({
      where: { userId: cleanUserId },
    });

    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      return NextResponse.json(
        { message: "Invalid request or OTP expired" },
        { status: 400 }
      );
    }

    // Check Expiry Time first
    if (new Date() > new Date(user.resetOtpExpiresAt)) {
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check OTP Match
    if (user.resetOtp !== cleanOtp) {
      return NextResponse.json(
        { message: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // 1. SECURITY: Clear the OTP immediately so it can never be reused (Replay Attack prevention)
    await prisma.user.update({
      where: { userId: cleanUserId },
      data: {
        resetOtp: null,
        resetOtpExpiresAt: null,
      },
    });

    // 2. Optional Security: Generate a temporary secure cookie for the password reset step (5 mins validity)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key");
    const resetToken = await new SignJWT({ userId: cleanUserId, canReset: true })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5m")
      .sign(secret);

    const response = NextResponse.json(
      { message: "OTP verified successfully", success: true },
      { status: 200 }
    );

    // Set HTTP-only Cookie
    response.cookies.set({
      name: "password_reset_token",
      value: resetToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}