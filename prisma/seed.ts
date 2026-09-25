import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { Role, Status } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Seeding database...");
  const superAdminEmail =
    process.env.SUPER_ADMIN_EMAIL || "superadmin@example.com";
  const superAdminPassword =process.env.SUPER_ADMIN_PASSWORD || "ExamplePassword123!";

  // Check if super admin already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (existingUser) {
    console.log(
      `Super Admin already exists (${superAdminEmail}). Skipping creation.`
    );
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

  // Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      userId:process.env.SUPER_ADMIN_USER_ID || "202604",
      name: "Super Admin",
      email: superAdminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Super Admin created successfully: ${superAdmin.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error while seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });