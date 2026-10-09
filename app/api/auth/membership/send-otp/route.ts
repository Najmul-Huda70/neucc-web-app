import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMembershipOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ১. ইমেইল ইতোমধ্যে নিবন্ধিত কিনা চেক
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 }
      );
    }

    // ২. OTP এবং Expiry সময় তৈরি
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes

    // ৩. OtpVerification টেবিলে Upsert (বা আলাদা টেবিলে সেভ)
    await prisma.otpVerification.upsert({
      where: { email: cleanEmail },
      update: { otp, expiresAt },
      create: { email: cleanEmail, otp, expiresAt },
    });

    // ৪. ইমেইল পাঠানো
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