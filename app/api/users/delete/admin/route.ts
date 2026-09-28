import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";
import { sendAccountDeletedNotification } from "@/lib/mailer";

export async function DELETE(req: Request) {
  const auth = await verifyRole(["ADMIN"]);
  if (!auth.isAuthorized) {
    return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  }
  const adminId = auth.user?.userId as string | undefined;

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ success: false, message: "userId is required." }, { status: 400 });
    if (userId === adminId) return NextResponse.json({ success: false, message: "You cannot delete your own account." }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { userId }, select: { name: true, email: true } });
    if (!targetUser) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });

    await prisma.user.delete({ where: { userId } });

    // Notify — must fetch details BEFORE delete, since the row won't exist afterward
    try {
      await sendAccountDeletedNotification({ email: targetUser.email, name: targetUser.name });
    } catch (mailErr) {
      console.error("Failed to send account deleted email:", mailErr);
    }

    return NextResponse.json({ success: true, message: "User deleted." });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ success: false, message: "Failed to delete user." }, { status: 500 });
  }
}