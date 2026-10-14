import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetOtpEmail } from "@/lib/mailer";

// Helper function to safely mask email
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart.substring(0, 2)}${"*".repeat(localPart.length - 2)}@${domain}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const identifier = body?.identifier;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { message: "Valid User ID or Email is required" },
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

    // 6 Digit Crypto/Random OTP জেনারেট করা
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 Minutes validity

    // ডাটাবেজে OTP আপডেট করা
    await prisma.user.update({
      where: { userId: user.userId },
      data: {
        resetOtp: otp,
        resetOtpExpiresAt: otpExpiresAt,
      },
    });

    // ইমেইল পাঠানো
    await sendPasswordResetOtpEmail({
      email: user.email,
      name: user.name,
      otp,
    });

    return NextResponse.json(
      {
        message: "OTP sent successfully to your registered email",
        emailMasked: maskEmail(user.email),
        userId: user.userId,
        resetOtpExpiresAt: otpExpiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send Password Reset OTP Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}