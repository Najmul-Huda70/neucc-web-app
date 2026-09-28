import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, password, rememberMe } = body;

    // ১. Validation Check
    if (!userId || !password) {
      return NextResponse.json(
        { message: "User ID and Password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid User ID or Password" },
        { status: 401 }
      );
    }

    // ৩. Password Verify
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid User ID or Password" },
        { status: 401 }
      );
    }

    // ৪. Checkbox টিক দেওয়া থাকলে ৩০ দিন, অন্যথায় ১ দিন মেয়াদ নির্ধারণ
    const jwtExpiresIn = rememberMe ? "30d" : "1d";
    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // JWT Token তৈরি
    const secret = process.env.JWT_SECRET || "fallback_super_secret_key";
    const token = jwt.sign(
      {
        userId: user.userId,
        role: user.role,
      },
      secret,
      { expiresIn: jwtExpiresIn }
    );

    // ৫. Cookie সেট করে Success Response দেওয়া
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          userId: user.userId,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // HttpOnly Cookie-তে টোকেন সেভ করা
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: maxAgeSeconds,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}