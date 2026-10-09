import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { CommitteeType, EventStatus, EventType, Role, Status } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { sendNewAccountCredentials } from "@/lib/mailer";

const cardBannerUrl = "/image/upcomming-events.webp";
const detailBannerUrl = "/image/upcomming-events.webp";
const eventTypes = Object.values(EventType);

function buildEvents(committeeId: string) {
  const baseDate = new Date("2026-03-01T10:00:00.000Z"); // মার্চ ২০২৬ থেকে শুরু

  return eventTypes.flatMap((type, typeIndex) =>
    Array.from({ length: 3 }, (_, eventIndex) => {
      const sequence = typeIndex * 3 + eventIndex + 1;

      const startDate = new Date(baseDate);
      startDate.setDate(baseDate.getDate() + (sequence - 1) * 7);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 4);

      return {
        slug: `${type.toLowerCase()}-${sequence}`,
        type,
        cardBannerUrl,
        detailBannerUrl,
        title: `${type.charAt(0)}${type.slice(1).toLowerCase()} Event ${eventIndex + 1}`,
        startDate,
        endDate,
        vanue: "NEU Campus Auditorium, Building A",
        shortDescription: `Join our ${type.toLowerCase()} event organized by the NEU Computer Club.`,
        description: `# ${type.charAt(0)}${type.slice(1).toLowerCase()} Event ${eventIndex + 1}: Masterclass & Interactive Session

- Welcome to the **NEU Computer Club** official *${type.toLowerCase()}* event! This session is designed to give students hands-on technical skills and deep architectural knowledge.

---

## 📌 Key Highlights & Overview

> **Note for Participants:** Please make sure to bring your updated laptop with Node.js and Git pre-installed. Doors open **15 minutes before** the starting time.

Here is a quick summary of what we will cover during this session:

- **In-Depth Concepts:** Modern software development and technology principles.
- **Interactive Code Labs:** Hands-on exercises guided by industry mentors.
- **Q&A & Career Guidance:** Direct networking with club executives and guest speakers.

---

## 🗓 Event Agenda & Timeline

| Time | Topic | Speaker / Host |
| :--- | :--- | :--- |
| **10:00 AM - 10:30 AM** | Registration & Keynote Opening | Executive Committee |
| **10:30 AM - 12:00 PM** | Technical Deep Dive & Demo | Lead Guest Speaker |
| **12:00 PM - 01:00 PM** | Hands-on Workshop / Challenge | Mentors Team |
| **01:00 PM - 02:00 PM** | Q&A, Networking & Refreshments | All Participants |

---

## 🛠 Recommended Prerequisites

### Checklist for Attendees:
- [x] Active NEU Student ID Card
- [x] Laptop & Charger
- [ ] VS Code / Preferred IDE installed
- [ ] Basic understanding of Programming Fundamentals

### Quick Code Example:
\`\`\`typescript
interface EventParticipant {
  id: string;
  name: string;
  email: string;
  isConfirmed: boolean;
}

async function registerParticipant(participant: EventParticipant): Promise<void> {
  console.log(\`Registering \${participant.name} for ${type}...\`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Registration successful!");
}
\`\`\`

---

## 🔗 Useful Links & Resources

1. Official Website: [NEU Computer Club](https://neu.edu.bd)
2. Resource Repository: [GitHub Organization](https://github.com)
3. For support, contact us at \`support@neucomputerclub.org\`.

***

*We look forward to seeing you at NEU Campus Auditorium! Don't miss out on this opportunity to upskill.*`,
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

  const result = await prisma.$transaction(
    async (tx) => {
      const committee = await tx.committee.upsert({
        where: { type_year: { type: CommitteeType.EXECUTIVE, year: 2026 } },
        update: { status: Status.ACTIVE },
        create: { type: CommitteeType.EXECUTIVE, year: 2026, status: Status.ACTIVE },
      });

      const existingUser = await tx.user.findFirst({
        where: { OR: [{ userId: adminUserId }, { email: adminEmail }] },
      });

      const adminUser = existingUser
        ? await tx.user.update({
            where: { userId: existingUser.userId },
            data: { name: adminName, role: Role.ADMIN, status: Status.ACTIVE },
          })
        : await tx.user.create({
            data: {
              userId: adminUserId,
              name: adminName,
              email: adminEmail,
              password: hashedPassword,
              role: Role.ADMIN,
              status: Status.ACTIVE,
            },
          });

      createdAdmin = !existingUser;

      const existingPost = await tx.post.findFirst({
        where: { committeeId: committee.committeeId, postTitle: "Advisors" },
      });

      const post = existingPost
        ? await tx.post.update({
            where: { postId: existingPost.postId },
            data: { status: Status.ACTIVE },
          })
        : await tx.post.create({
            data: {
              postTitle: "Advisors",
              committeeId: committee.committeeId,
              status: Status.ACTIVE,
            },
          });

      await tx.userPost.upsert({
        where: { postId_userId: { postId: post.postId, userId: adminUser.userId } },
        update: { committeeId: committee.committeeId, status: Status.ACTIVE },
        create: {
          postId: post.postId,
          userId: adminUser.userId,
          committeeId: committee.committeeId,
          status: Status.ACTIVE,
        },
      });

      await tx.events.deleteMany();
      await tx.events.createMany({ data: buildEvents(committee.committeeId) });

      return { committee, post, adminUser };
    },
    { maxWait: 30_000, timeout: 120_000 }
  );

  console.log(`Seeded admin: ${result.adminUser.userId}`);
  console.log(`Seeded committee: ${result.committee.type}-${result.committee.year}`);
  console.log(`Seeded post: ${result.post.postTitle}`);
  console.log(`Seeded ${eventTypes.length * 3} events with dates, venue, and banners`);

  if (createdAdmin) {
    try {
      await sendNewAccountCredentials({
        email: adminEmail,
        name: adminName,
        userId: result.adminUser.userId,
        password: adminPassword,
        role: Role.ADMIN,
        postTitle: result.post.postTitle,
        customHeading: "Welcome to NEU Computer Club Portal!",
        customSubject: "Initial Admin Credentials - NEU Computer Club",
      });
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