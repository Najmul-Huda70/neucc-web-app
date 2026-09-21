import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The 20 constitutional posts (Constitution §3.2 / §3.3).
// eligibleYear: minimum academic year required to contest that post.
//
// This is structural reference data the whole system depends on to
// function at all (every User, Candidate, and ElectionResult points at a
// Post) — it is NOT demo/sample data, so it stays. Nothing in this file
// creates any User, Event, Contest, or GalleryItem row: this project's
// only account is the one created by `npm run prisma:onboard-admin` (see
// docs/DEPLOYMENT_GUIDE.md) — no seeded demo accounts, no seeded content.
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

// Standard income/expense categories. Also structural, not demo data — a
// Treasurer can add more later via POST /api/panel/finance/fund-heads
// (Step 9), but the system needs at least these to record its first
// transaction against.
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

  console.log("Seed complete — no accounts, events, contests, or gallery items were created.");
  console.log("Run `npm run prisma:onboard-admin` next to create the President's account.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
