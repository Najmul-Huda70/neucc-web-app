import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await verifyRole(["ADMIN"]);
    if (!auth.isAuthorized) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const categories = await prisma.sarok.findMany({
      include: {
        _count: { select: { notices: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    console.error("Get Sarok Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
// POST: নতুন সারোক ক্যাটাগরি যোগ করা
export async function POST(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN"]);
    if (!auth.isAuthorized) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => null);
    const { code, name, shortName } = body || {};

    if (!code || !name || !shortName) {
      return NextResponse.json({ success: false, error: "Missing required fields (code, name, shortName)" }, { status: 400 });
    }

    const newCategory = await prisma.sarok.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
      },
    });

    return NextResponse.json({ success: true, message: "Sarok category created successfully", data: newCategory }, { status: 201 });
  } catch (error: any) {
    console.error("Create Sarok Error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Code, Name, or ShortName already exists." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: সারোক ক্যাটাগরি আপডেট করা
export async function PATCH(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN"]);
    if (!auth.isAuthorized) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => null);
    const { code, name, shortName } = body || {};

    if (!code) {
      return NextResponse.json({ success: false, error: "Category code is required for update" }, { status: 400 });
    }

    const updatedCategory = await prisma.sarok.update({
      where: { code },
      data: {
        ...(name && { name: name.trim() }),
        ...(shortName && { shortName: shortName.trim().toUpperCase() }),
      },
    });

    return NextResponse.json({ success: true, message: "Sarok category updated successfully", data: updatedCategory }, { status: 200 });
  } catch (error) {
    console.error("Update Sarok Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE: সারোক ক্যাটাগরি ডিলিট করা (নোটিশ চেক সহ)
export async function DELETE(req: Request) {
  try {
    const auth = await verifyRole(["ADMIN"]);
    if (!auth.isAuthorized) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, error: "Category code is required" }, { status: 400 });
    }

    // চেক করা এই ক্যাটাগরিতে কোনো নোটিশ আছে কিনা
    const noticeCount = await prisma.notice.count({
      where: { shortName: code }, // অথবা আপনার রিলেশন অনুযায়ী ফিল্ড চেক করবেন
    });

    // বিকল্প চেক (যদি শর্টনেম দিয়ে বাইন্ড করা থাকে):
    const categoryWithNotices = await prisma.sarok.findUnique({
      where: { code },
      include: { _count: { select: { notices: true } } },
    });

    if (categoryWithNotices && categoryWithNotices._count.notices > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete! This category contains active notices." },
        { status: 400 }
      );
    }

    await prisma.sarok.delete({
      where: { code },
    });

    return NextResponse.json({ success: true, message: "Sarok category deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Sarok Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
  }
}