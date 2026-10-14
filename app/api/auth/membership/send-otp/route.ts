import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMembershipOtpEmail } from "@/lib/mailer";
import { getSystemSettings } from "@/lib/services/system-settings";

export async function POST(req: Request) {
  try {
    // 1. Check if membership registration is open
    const settingsRes = await getSystemSettings();
    if (!settingsRes.success || !settingsRes.data?.isMembershipOpen) {
      return NextResponse.json(
        { error: "Membership registration is currently closed by the admin." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 }
      );
    }

    // 3. Generate OTP & Expiry (5 mins)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 4. Upsert to OtpVerification table
    await prisma.otpVerification.upsert({
      where: { email: cleanEmail },
      update: { otp, expiresAt },
      create: { email: cleanEmail, otp, expiresAt },
    });

    // 5. Send Email
    await sendMembershipOtpEmail({ email: cleanEmail, otp });

    return NextResponse.json(
      { success: true, message: "Verification OTP sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send Membership OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}