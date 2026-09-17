import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/passwords";

const prisma = new PrismaClient();

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const name = required("ADMIN_NAME");
  const email = required("ADMIN_EMAIL").toLowerCase();
  const password = required("ADMIN_PASSWORD");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

  const post = await prisma.post.upsert({
    where: { name: "President" },
    update: {},
    create: { name: "President", eligibleYear: 4, rank: 1 },
  });
  const committee = await prisma.committee.findFirst({ where: { type: "EXECUTIVE", status: "ACTIVE" }, orderBy: { startDate: "desc" } })
    ?? await prisma.committee.create({ data: { type: "EXECUTIVE", status: "ACTIVE", startDate: new Date() } });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "EXECUTIVE_COMMITTEE", status: "ACTIVE", postId: post.id, committeeId: committee.id },
    create: { name, email, passwordHash, role: "EXECUTIVE_COMMITTEE", postId: post.id, committeeId: committee.id },
  });
  console.log(`Admin onboarding complete for ${user.email}. Remove ADMIN_PASSWORD from the environment now.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());