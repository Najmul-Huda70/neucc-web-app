import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json(); // User ID or Email

    if (!identifier) {
      return NextResponse.json(
        { message: "User ID or Email is required" },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // User ID বা Email দিয়ে ইউজার খোঁজা
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { userId: cleanIdentifier.toUpperCase() },
          { email: cleanIdentifier.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this User ID or Email" },
        { status: 404 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "Your account is currently inactive or DEACTIVATED" },
        { status: 403 }
      );
    }

    // 6 Digit Random OTP জেনারেট করা
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 Minutes validity

    // ডাটাবেজে OTP সেভ করা
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        resetOtp: otp,
        resetOtpExpiresAt: otpExpiresAt,
      },
    });

    // ইমেইল মেলিং ফাংশন কল
    await sendPasswordResetOtpEmail({
      email: user.email,
      name: user.name,
      otp,
    });

    return NextResponse.json(
      {
        message: "OTP sent successfully to your registered email",
        emailMasked: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length)),
        userId: user.userId,
        resetOtpExpiresAt: otpExpiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}