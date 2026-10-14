import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth";

export async function getSystemSettings() {
  try {
    let setting = await prisma.systemSetting.findFirst();

    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: {
          isMembershipOpen: false,
        },
      });
    }

    return { success: true, data: setting };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return { success: false, error: "Failed to fetch settings", status: 500 };
  }
}

export async function updateSystemSettingsWithAuth(isMembershipOpen: boolean) {
  const auth = await verifyRole(["ADMIN"]);
  if (!auth.isAuthorized) {
    return { success: false, error: auth.message, status: auth.status };
  }

  try {
    let setting = await prisma.systemSetting.findFirst();

    const updatedSetting = setting
      ? await prisma.systemSetting.update({
          where: { id: setting.id },
          data: { isMembershipOpen },
        })
      : await prisma.systemSetting.create({
          data: { isMembershipOpen },
        });

    return { success: true, data: updatedSetting };
  } catch (error) {
    console.error("Error updating system settings:", error);
    return { success: false, error: "Failed to update settings", status: 500 };
  }
}