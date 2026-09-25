import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { AuthUser, JWTPayload } from "@/lib/types";
import DashboardClientLayout from "@/components/dashboard/DashboardClientLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ১. Cookie থেকে টোকেন নিন
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/login");
  }

  let decodedToken: JWTPayload;

  // ২. JWT Token ভেরিফাই করুন (Reusable JWTPayload টাইপ দিয়ে)
  try {
    const secret = process.env.JWT_SECRET || "fallback_super_secret_key";
    decodedToken = jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    redirect("/login");
  }
  // console.log(decodedToken);
  // ৩. Database থেকে Fresh User Data আনুন
  const user = await prisma.user.findUnique({
    where: { userId: decodedToken.userId },
    select: {
      userId: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
    },
  });

  // ইউজার না থাকলে বা Status BLOCKED থাকলে রিডাইরেক্ট
  if (!user || user.status === "BLOCKED") {
    redirect("/login");
  }

  // ৪. AuthUser Interface অনুযায়ী ডাটা ফরম্যাট তৈরি
  const currentUser: AuthUser = {
    userId: user.userId,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    status: user.status,
  };

  return (
    <DashboardClientLayout user={currentUser}>
      {children}
    </DashboardClientLayout>
  );
}