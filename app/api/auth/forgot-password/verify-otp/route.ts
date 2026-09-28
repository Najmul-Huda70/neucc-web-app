import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, otp } = await req.json();

    if (!userId || !otp) {
      return NextResponse.json(
        { message: "User ID and OTP are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user || !user.resetOtp || !user.resetOtpExpiresAt) {
      return NextResponse.json(
        { message: "Invalid request or OTP expired" },
        { status: 400 }
      );
    }

    // Check OTP Match & Expiry Time
    if (user.resetOtp !== otp.trim()) {
      return NextResponse.json(
        { message: "Invalid OTP code" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(user.resetOtpExpiresAt)) {
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}