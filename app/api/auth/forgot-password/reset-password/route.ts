import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, otp, newPassword } = await req.json();

    if (!userId || !otp || !newPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (
      !user ||
      user.resetOtp !== otp.trim() ||
      !user.resetOtpExpiresAt ||
      new Date() > new Date(user.resetOtpExpiresAt)
    ) {
      return NextResponse.json(
        { message: "year expired. Please start over." },
        { status: 400 }
      );
    }

    // Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update User Password and Clear OTP Fields
    await prisma.user.update({
      where: { userId },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiresAt: null,
      },
    });

    return NextResponse.json(
      { message: "Password updated successfully. Please log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}