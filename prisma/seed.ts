import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { CommitteeType, EventStatus, EventType, Role, Status } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { sendNewAccountCredentials } from "@/lib/mailer";

const cardBannerUrl = "/image/logo-neu-jpg.jpg";
const detailBannerUrl = "/image/logo-neu-jpg.jpg";
const eventTypes = Object.values(EventType);

function buildEvents(committeeId: string) {
  return eventTypes.flatMap((type, typeIndex) =>
    Array.from({ length: 3 }, (_, eventIndex) => {
      const sequence = typeIndex * 3 + eventIndex + 1;
      return {
        slug: `${type.toLowerCase()}-${sequence}`,
        type,
        cardBannerUrl,
        detailBannerUrl,
        title: `${type.charAt(0)}${type.slice(1).toLowerCase()} Event ${eventIndex + 1}`,
        shortDescription: `Join our ${type.toLowerCase()} event organized by the NEU Computer Club.`,
        description: `A practical NEU Computer Club ${type.toLowerCase()} event for students and members.`,
        status: EventStatus.PUBLISHED,
        committeeId,
      };
    })
  );
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  const adminUserId = process.env.ADMIN_USER_ID || "vchg5dfgh5";
  const adminName = process.env.ADMIN_NAME || "Initial Admin";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  let createdAdmin = false;

  const result = await prisma.$transaction(async (tx) => {
    const committee = await tx.committee.upsert({
      where: { type_year: { type: CommitteeType.EXECUTIVE, year: 2026 } },
      update: { status: Status.ACTIVE },
      create: { type: CommitteeType.EXECUTIVE, year: 2026, status: Status.ACTIVE },
    });

    const existingUser = await tx.user.findFirst({ where: { OR: [{ userId: adminUserId }, { email: adminEmail }] } });
    const adminUser = existingUser
      ? await tx.user.update({ where: { userId: existingUser.userId }, data: { name: adminName, role: Role.ADMIN, status: Status.ACTIVE } })
      : await tx.user.create({ data: { userId: adminUserId, name: adminName, email: adminEmail, password: hashedPassword, role: Role.ADMIN, status: Status.ACTIVE } });
    createdAdmin = !existingUser;

    const existingPost = await tx.post.findFirst({ where: { committeeId: committee.committeeId, postTitle: "Advisors" } });
    const post = existingPost
      ? await tx.post.update({ where: { postId: existingPost.postId }, data: { status: Status.ACTIVE } })
      : await tx.post.create({ data: { postTitle: "Advisors", committeeId: committee.committeeId, status: Status.ACTIVE } });

    await tx.userPost.upsert({
      where: { postId_userId: { postId: post.postId, userId: adminUser.userId } },
      update: { committeeId: committee.committeeId, status: Status.ACTIVE },
      create: { postId: post.postId, userId: adminUser.userId, committeeId: committee.committeeId, status: Status.ACTIVE },
    });

    await tx.events.deleteMany();
    await tx.events.createMany({ data: buildEvents(committee.committeeId) });
    return { committee, post, adminUser };
  }, { maxWait: 30_000, timeout: 120_000 });

  console.log(`Seeded admin: ${result.adminUser.userId}`);
  console.log(`Seeded committee: ${result.committee.type}-${result.committee.year}`);
  console.log(`Seeded post: ${result.post.postTitle}`);
  console.log(`Seeded ${eventTypes.length * 3} events with card and detail banners`);

  if (createdAdmin) {
    try {
      await sendNewAccountCredentials({ email: adminEmail, name: adminName, userId: result.adminUser.userId, password: adminPassword, role: Role.ADMIN, postTitle: result.post.postTitle, customHeading: "Welcome to NEU Computer Club Portal!", customSubject: "Initial Admin Credentials - NEU Computer Club" });
      console.log("Admin credentials email sent.");
    } catch (error) {
      console.error("Failed to send admin credentials email:", error);
    }
  }
}

main()
  .catch((error) => {
    console.error("Error while seeding:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });