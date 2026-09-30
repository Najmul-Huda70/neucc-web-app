/*
  Warnings:

  - Changed the type of `type` on the `committees` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CommitteeType" AS ENUM ('EXECUTIVE', 'ELECTION');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WORKSHOP', 'SEMINAR', 'CONFERENCE', 'CONTEST', 'ELECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('TITLE', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('REGISTRATION', 'MEETING', 'RULES', 'SLIDES', 'RECORDING', 'OTHER');

-- AlterTable
ALTER TABLE "committees" DROP COLUMN "type",
ADD COLUMN     "type" "CommitteeType" NOT NULL;

-- DropEnum
DROP TYPE "Type";

-- CreateTable
CREATE TABLE "events" (
    "eventId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "bannerUrl" TEXT,
    "title" TEXT NOT NULL,
    "shortDescription" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "registrationRequired" BOOLEAN NOT NULL DEFAULT false,
    "registrationDeadline" TIMESTAMP(3),
    "maxSeats" INTEGER,
    "fee" DECIMAL(10,2),
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "committeeId" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "sponsorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("sponsorId")
);

-- CreateTable
CREATE TABLE "event_sponsors" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "tier" "SponsorTier",
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galleries" (
    "galleryId" TEXT NOT NULL,
    "eventId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "location" TEXT,
    "date" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("galleryId")
);

-- CreateTable
CREATE TABLE "event_resources" (
    "resourceId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DEACTIVATED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_resources_pkey" PRIMARY KEY ("resourceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_committeeId_type_status_idx" ON "events"("committeeId", "type", "status");

-- CreateIndex
CREATE INDEX "events_status_start_idx" ON "events"("status", "start");

-- CreateIndex
CREATE INDEX "event_sponsors_sponsorId_idx" ON "event_sponsors"("sponsorId");

-- CreateIndex
CREATE UNIQUE INDEX "event_sponsors_eventId_sponsorId_key" ON "event_sponsors"("eventId", "sponsorId");

-- CreateIndex
CREATE INDEX "galleries_eventId_idx" ON "galleries"("eventId");

-- CreateIndex
CREATE INDEX "event_resources_eventId_status_idx" ON "event_resources"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "committees_type_year_key" ON "committees"("type", "year");

-- CreateIndex
CREATE INDEX "posts_committeeId_idx" ON "posts"("committeeId");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "user_posts_committeeId_idx" ON "user_posts"("committeeId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees"("committeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sponsors" ADD CONSTRAINT "event_sponsors_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_sponsors" ADD CONSTRAINT "event_sponsors_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsors"("sponsorId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("eventId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_resources" ADD CONSTRAINT "event_resources_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;
