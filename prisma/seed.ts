import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/passwords";

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

const DEMO_EXECUTIVES = [
  "Arafat Hossain", "Nusrat Jahan", "Tanvir Ahmed", "Maliha Islam", "Sakib Hasan",
  "Faria Rahman", "Rafiul Karim", "Sadia Akter", "Mehedi Hasan", "Jannatul Ferdous",
  "Shakil Ahmed", "Tasnim Tabassum", "Imran Kabir", "Mim Chowdhury", "Fahim Rahman",
  "Sanjida Sultana", "Nayeem Islam", "Sumaiya Haque", "Adnan Hossain", "Raisa Anjum",
];

const DEMO_EVENTS = [
  ["Algorithm Sprint 2026", "A focused competitive programming challenge for emerging problem solvers.", "2026-11-12", "CSE Lab 204", "COMPETITION"],
  ["Cyber Security Workshop", "Practical foundations of ethical hacking, threat analysis, and digital safety.", "2026-10-08", "Seminar Hall", "WORKSHOP"],
  ["Product Design Meetup", "An evening of UI thinking, product critique, and student-led ideas.", "2026-09-28", "Innovation Hub", "MEETUP"],
  ["Next.js Builders Lab", "Build a production-ready web experience with React, TypeScript, and Next.js.", "2026-12-03", "Computer Center", "WORKSHOP"],
  ["Tech Career Roundtable", "A candid conversation with alumni building careers in software and data.", "2026-10-22", "Auditorium 1", "SEMINAR"],
  ["Open Source Day", "Find your first issue, meet contributors, and ship a small open-source fix.", "2026-11-26", "CSE Lab 102", "MEETUP"],
  ["Freshers Programming Bootcamp", "A friendly introduction to problem solving, Git, and coding practice.", "2026-08-14", "Computer Center", "WORKSHOP"],
  ["Campus Hackfest 2026", "Teams prototype useful solutions for campus life in a high-energy build day.", "2026-07-19", "Innovation Hub", "COMPETITION"],
  ["UI/UX Design Clinic", "Portfolio reviews and hands-on feedback for student designers and builders.", "2026-06-11", "Design Studio", "MEETUP"],
  ["IUPC Practice Night", "A timed team practice night with editorials and mentor walkthroughs.", "2026-05-23", "CSE Lab 204", "COMPETITION"],
] as const;

const DEMO_CONTESTS = [
  ["NEUCC Algorithm Sprint", "2026-11-12", "PROGRAMMING", "Registration open", "#"],
  ["NEUCC CTF Challenge", "2026-08-14", "CTF", "Champion: Team ZeroDay", null],
  ["Campus Hackfest", "2026-07-19", "HACKATHON", "Winner: Team CampusConnect", null],
  ["IUPC Warm-up League", "2026-05-23", "PROGRAMMING", "Top 3: NEUCC Alpha", null],
] as const;

const DEMO_GALLERY_URLS = [
  "photo-1516321318423-f06f85e504b3", "photo-1515879218367-8466d910aaa4", "photo-1531482615713-2afd69097998",
  "photo-1523240795612-9a054b0db644", "photo-1523580846011-d3a5bc25702b", "photo-1517245386807-bb43f82c33c4",
  "photo-1497366754035-f200968a6e72", "photo-1497366811353-6870744d04b2", "photo-1504384308090-c894fdcc538d",
  "photo-1519389950473-47ba0277781c", "photo-1517048676732-d65bc937f952", "photo-1521737711867-e3b97375f902",
  "photo-1552664730-d307ca884978", "photo-1542744173-8e7e53415bb0", "photo-1556761175-b413da4baf72",
  "photo-1553877522-43269d4ea984", "photo-1556761175-5973dc0f32e7", "photo-1516321497487-e288fb19713f",
  "photo-1522071820081-009f0129c71c", "photo-1531058020387-3be344556be6",
];

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


  console.log("Seeding demo executive committee...");
  const executiveCommittee = await prisma.committee.findFirst({
    where: { type: "EXECUTIVE", status: "ACTIVE" },
  }) ?? await prisma.committee.create({
    data: {
      type: "EXECUTIVE",
      status: "ACTIVE",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2027-01-01T00:00:00.000Z"),
    },
  });
  const demoPasswordHash = await hashPassword("NEUCC-demo-2026");
  for (const [index, post] of POSTS.entries()) {
    const email = `demo.${post.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@neucc.test`;
    await prisma.user.upsert({
      where: { email },
      update: { name: DEMO_EXECUTIVES[index], postId: (await prisma.post.findUniqueOrThrow({ where: { name: post.name } })).id, committeeId: executiveCommittee.id },
      create: {
        name: DEMO_EXECUTIVES[index],
        email,
        passwordHash: demoPasswordHash,
        role: "EXECUTIVE_COMMITTEE",
        postId: (await prisma.post.findUniqueOrThrow({ where: { name: post.name } })).id,
        committeeId: executiveCommittee.id,
        studentId: `NEUCC-${String(index + 1).padStart(3, "0")}`,
        batch: 2022 + (index % 4),
      },
    });
  }

  const demoUser = await prisma.user.findFirstOrThrow({ where: { committeeId: executiveCommittee.id } });

  console.log("Seeding demo events...");
  for (const [title, description, date, venue, category] of DEMO_EVENTS) {
    const existing = await prisma.event.findFirst({ where: { title } });
    const eventData = {
      title,
      description,
      date: new Date(`${date}T10:00:00.000Z`),
      venue,
      guests: "NEUCC mentors and invited community speakers",
      registrationLink: date >= "2026-09-17" ? "#" : null,
      category,
      status: date >= "2026-09-17" ? "UPCOMING" as const : "PAST" as const,
      createdById: demoUser.id,
    };
    if (existing) await prisma.event.update({ where: { id: existing.id }, data: eventData });
    else await prisma.event.create({ data: eventData });
  }

  console.log("Seeding demo contests...");
  for (const [name, date, type, result, registrationLink] of DEMO_CONTESTS) {
    const existing = await prisma.contest.findFirst({ where: { name } });
    const contestData = { name, date: new Date(`${date}T10:00:00.000Z`), type, result, registrationLink };
    if (existing) await prisma.contest.update({ where: { id: existing.id }, data: contestData });
    else await prisma.contest.create({ data: contestData });
  }

  console.log("Seeding demo gallery...");
  for (const [index, imageId] of DEMO_GALLERY_URLS.entries()) {
    const eventName = DEMO_EVENTS[index % DEMO_EVENTS.length][0];
    const url = `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1200&q=85`;
    const existing = await prisma.galleryItem.findFirst({ where: { url } });
    if (!existing) {
      await prisma.galleryItem.create({
        data: { url, eventName, year: 2026, isVideo: index === 6 || index === 15 },
      });
    }
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
