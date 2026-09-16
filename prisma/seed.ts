import { Prisma, PrismaClient, Role, CommitteeType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// The 20 constitutional posts (Constitution §3.2 / §3.3).
// eligibleYear: minimum academic year required to contest that post.
const POSTS: { name: string; eligibleYear: number; isAssistant?: boolean; rank: number }[] = [
  { name: "President", eligibleYear: 4, rank: 1 },
  { name: "Vice-President", eligibleYear: 4, rank: 2 },
  { name: "General Secretary", eligibleYear: 3, rank: 3 },
  { name: "Assistant General Secretary", eligibleYear: 2, isAssistant: true, rank: 4 },
  { name: "Treasurer", eligibleYear: 4, rank: 5 },
  { name: "Organizing Secretary", eligibleYear: 3, rank: 6 },
  { name: "Assistant Organizing Secretary", eligibleYear: 2, isAssistant: true, rank: 7 },
  { name: "Programming Secretary", eligibleYear: 4, rank: 8 },
  { name: "Assistant Programming Secretary", eligibleYear: 2, isAssistant: true, rank: 9 },
  { name: "Event Management Secretary", eligibleYear: 3, rank: 10 },
  { name: "Assistant Event Management Secretary", eligibleYear: 2, isAssistant: true, rank: 11 },
  { name: "Editor Secretary", eligibleYear: 3, rank: 12 },
  { name: "Assistant Editor Secretary", eligibleYear: 1, isAssistant: true, rank: 13 },
  { name: "Information Secretary", eligibleYear: 3, rank: 14 },
  { name: "Assistant Information Secretary", eligibleYear: 2, isAssistant: true, rank: 15 },
  { name: "Sports Secretary", eligibleYear: 3, rank: 16 },
  { name: "Assistant Sports Secretary", eligibleYear: 1, isAssistant: true, rank: 17 },
  { name: "Publicity & Publication Secretary", eligibleYear: 3, rank: 18 },
  { name: "Assistant Publicity & Publication Secretary", eligibleYear: 2, isAssistant: true, rank: 19 },
  { name: "Chief Election Commissioner", eligibleYear: 4, rank: 20 },
];

const INCOME_HEADS = ["Membership Fee", "Sponsorship", "Event Income", "Donation"];
const EXPENSE_HEADS = ["Event Cost", "Printing", "Refreshments", "Logistics"];

async function main() {
  console.log("Seeding posts...");
  for (const post of POSTS) {
    await prisma.post.upsert({
      where: { name: post.name },
      update: {},
      create: post,
    });
  }

  console.log("Seeding fund heads...");
  for (const name of INCOME_HEADS) {
    await prisma.fundHead.upsert({
      where: { name_type: { name, type: "INCOME" } },
      update: {},
      create: { name, type: "INCOME" },
    });
  }
  for (const name of EXPENSE_HEADS) {
    await prisma.fundHead.upsert({
      where: { name_type: { name, type: "EXPENSE" } },
      update: {},
      create: { name, type: "EXPENSE" },
    });
  }

  console.log("Seeding an initial test Executive Committee + admin user...");
  const committee =
    (await prisma.committee.findFirst({
      where: { type: CommitteeType.EXECUTIVE, status: "ACTIVE" },
      orderBy: { startDate: "desc" },
    })) ??
    (await prisma.committee.create({
      data: {
        type: CommitteeType.EXECUTIVE,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      },
    }));

  const president = await prisma.post.findUniqueOrThrow({ where: { name: "President" } });
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

  await prisma.user.upsert({
    where: { email: "president@neucc.test" },
    update: {},
    create: {
      name: "Test President",
      email: "president@neucc.test",
      passwordHash,
      role: Role.EXECUTIVE_COMMITTEE,
      postId: president.id,
      committeeId: committee.id,
    },
  });

  console.log("Seeding starter site content blocks (About/Home text)...");
  const CONTENT_SEED: Record<string, Prisma.InputJsonValue | Prisma.JsonNullValueInput> = {
    "about.mission": "To build a collaborative community of student programmers, researchers, and tech enthusiasts within the Department of CSE, Netrokona University.",
    "about.vision": "To be the leading student tech community in the region, producing competitive programmers, researchers, and industry-ready engineers.",
    "about.history": "Founded to give CSE students a dedicated space for programming practice, contests, and tech events — replace with the club's real founding story.",
    "about.facultyAdvisors": [],
    "home.chairpersonMessage": Prisma.JsonNull,
    "home.moderatorMessage": Prisma.JsonNull,
    "home.aboutSnapshot": "NEUCC is the official Computer Club of the Department of CSE, Netrokona University — running contests, workshops, and events year-round.",
  };
  for (const [key, value] of Object.entries(CONTENT_SEED)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log("Seed complete.");
}main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
