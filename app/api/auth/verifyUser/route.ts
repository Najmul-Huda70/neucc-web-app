import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    // 1. Get token from Cookies or Authorization Header
    const cookieStore = await cookies();
    let token = cookieStore.get("accessToken")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // 2. Verify JWT Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { authenticated: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    // 3. Fetch latest user state from database
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        postId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 4. Check if user is BLOCKED
    if (user.status === "BLOCKED") {
      return NextResponse.json(
        { authenticated: false, message: "Account is blocked" },
        { status: 403 }
      );
    }

    // 5. Return Verified User Data & Role
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role, // 'ADMIN' | 'MODARATOR' | 'MEMBER'
          status: user.status,
          image: user.image,
          postId: user.postId,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify User Route Error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}