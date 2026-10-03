import "dotenv/config";
import { EventStatus, EventType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const eventTypes = Object.values(EventType);
const cardBannerUrl = "/image/logo-neu-jpg.jpg";
const detailBannerUrl = "/image/logo-neu-jpg.jpg";

async function main() {
  const committee = await prisma.committee.findFirst({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    select: { committeeId: true },
  });

  if (!committee) {
    throw new Error("No committee exists. Create a committee before seeding events.");
  }

  const events = eventTypes.flatMap((type, typeIndex) =>
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
        committeeId: committee.committeeId,
      };
    })
  );

  await prisma.$transaction(async (tx) => {
    await tx.events.deleteMany();
    await tx.events.createMany({ data: events });
  }, { maxWait: 30_000, timeout: 120_000 });

  const counts = await prisma.events.groupBy({ by: ["type"], _count: { _all: true } });
  console.table(counts.map(({ type, _count }) => ({ type, count: _count._all })));
}

main()
  .catch((error) => {
    console.error("Failed to reset events:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });