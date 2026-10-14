import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, website_hp } = body;

    // 1. Honeypot check for bots
    if (website_hp) {
      return NextResponse.json(
        { success: true, message: "Your message has been sent successfully!" },
        { status: 200 }
      );
    }

    // 2. Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // 3. Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CLUB_EMAIL,
        pass: process.env.CLUB_EMAIL_PASS,
      },
    });

    // 4. Send Email
    await transporter.sendMail({
      from: `"NEUCC Website" <${process.env.CLUB_EMAIL}>`,
      to: process.env.CLUB_EMAIL,
      replyTo: email,
      subject: `New Contact Form Message: ${subject || "No Subject"}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0d9488;">New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <p><strong>Message:</strong></p>
          <p style="background: #f8fafc; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}