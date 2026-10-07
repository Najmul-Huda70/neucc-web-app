-- AlterTable
ALTER TABLE "events" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "vanue" TEXT;

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");
