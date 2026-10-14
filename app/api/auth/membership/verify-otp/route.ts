import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;
    const otp = body?.otp;

    if (!email || !otp || typeof email !== "string" || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const record = await prisma.otpVerification.findUnique({
      where: { email: cleanEmail },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid request or OTP expired" },
        { status: 400 }
      );
    }

    // Check Expiry Time first
    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check OTP Match
    if (record.otp !== cleanOtp) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // ১. SECURITY: ওটিপি একবার সফলভাবে ভেরিফাই হলে তা টেবিল থেকে ডিলিট করে দিন
    await prisma.otpVerification.delete({
      where: { email: cleanEmail },
    }).catch(() => {});

    // ২. SECURITY: jose দিয়ে টোকেন তৈরি (মেয়াদ ৫ মিনিট করা হলো)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key");
    const verificationToken = await new SignJWT({ email: cleanEmail, verified: true })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5m") // ৫ মিনিট সেট করা হয়েছে
      .sign(secret);

    const response = NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );

    // ৩. HTTP-only Cookie সেট করা (মেয়াদ ৫ মিনিট / ৩০০ সেকেন্ড)
    response.cookies.set({
      name: "membership_verified",
      value: verificationToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 300, // ৫ মিনিট (৩০০ সেকেন্ড)
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}