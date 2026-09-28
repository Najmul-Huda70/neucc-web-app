import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { Role, Status, Type } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNewAccountCredentials } from "@/lib/mailer"; 

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  const adminUserId = process.env.ADMIN_USER_ID || "vchg5dfgh5";
  const adminName = process.env.ADMIN_NAME || "Initial Admin";

  // 1. Check if Admin already exists
  const existingUser = await prisma.user.findUnique({
    where: { userId: adminUserId },
  });

  if (existingUser) {
    console.log(
      `⚠️ Admin user already exists (${adminUserId}). Skipping seed execution.`
    );
    return;
  }

  // 2. Hash Password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // 3. Database Transaction to Create Committee, Admin User, and Post together
  const result = await prisma.$transaction(async (tx) => {
    // Step A: Create Initial Active Committee
    const committee = await tx.committee.create({
      data: {
        type: Type.EXECUTIVE,
        year: 2026,
        status: Status.ACTIVE,
      },
    });

    // Step B: Create First ADMIN User
    const adminUser = await tx.user.create({
      data: {
        userId: adminUserId,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        status: Status.ACTIVE,
      },
    });

    // Step C: Create Executive Post
    const post = await tx.post.create({
      data: {
        postTitle: "Advisors",
        committeeId: committee.committeeId,
        status: Status.ACTIVE,
      },
    });

    // Step D: Create ADMIN user_post connection
    const userPost = await tx.userPost.create({
      data: {
        postId: post.postId,
        userId: adminUserId,
        committeeId: committee.committeeId,
        status: Status.ACTIVE,
      },
    });

    return { committee, post, adminUser, userPost };
  });

  console.log("✅ Database seeded successfully!");
  console.log(
    `📌 Created Committee: The ${result.committee.type} Committee-${result.committee.year}`
  );
  console.log(`📌 Created Post: ${result.post.postTitle}`);
  console.log(`👤 Created Admin User ID: ${result.adminUser.userId}`);

  // 4. Send Credentials Email to the newly created Admin
  try {
    console.log(`📧 Sending credentials email to ${adminEmail}...`);
    await sendNewAccountCredentials({
      email: adminEmail,
      name: adminName,
      userId: adminUserId,
      password: adminPassword, // প্লেন পাসওয়ার্ড পাঠানো হচ্ছে
      role: Role.ADMIN,
      postTitle: result.post.postTitle,
      customHeading: "Welcome to NEU Computer Club Portal!",
      customSubject: "🎉 Initial Admin Credentials - NEU Computer Club",
    });
    console.log("✉️ Email sent successfully!");
  } catch (emailError) {
    console.error("⚠️ Failed to send email during seeding:", emailError);
  }
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