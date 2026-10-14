import { NextResponse } from "next/server";
import { updateSystemSettingsWithAuth } from "@/lib/services/system-settings";

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { isMembershipOpen } = body || {};

    if (typeof isMembershipOpen !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid value for isMembershipOpen" },
        { status: 400 }
      );
    }

    const result = await updateSystemSettingsWithAuth(isMembershipOpen);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Membership registration is now ${isMembershipOpen ? "OPEN" : "CLOSED"}`,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update System Settings API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}