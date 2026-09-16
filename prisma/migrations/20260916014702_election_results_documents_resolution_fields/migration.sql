/*
  Warnings:

  - Added the required column `convener` to the `Resolution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingTime` to the `Resolution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `president` to the `Resolution` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResultOutcome" AS ENUM ('ELECTED', 'UNOPPOSED', 'WALKOVER', 'NO_CANDIDATE');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "isWinner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "eligibleBatches" JSONB,
ADD COLUMN     "resultDeclarationUrl" TEXT,
ADD COLUMN     "resultPublishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- AlterTable
ALTER TABLE "Resolution" ADD COLUMN     "convener" TEXT NOT NULL,
ADD COLUMN     "implementationResponsibility" JSONB,
ADD COLUMN     "meetingTime" TEXT NOT NULL,
ADD COLUMN     "president" TEXT NOT NULL,
ADD COLUMN     "signatories" JSONB;

-- CreateTable
CREATE TABLE "ElectionResult" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "candidateId" TEXT,
    "outcome" "ResultOutcome" NOT NULL,
    "declaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "noticeId" TEXT,
    "resolutionId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ElectionResult_candidateId_key" ON "ElectionResult"("candidateId");

-- CreateIndex
CREATE INDEX "ElectionResult_candidateId_idx" ON "ElectionResult"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionResult_electionId_postId_key" ON "ElectionResult"("electionId", "postId");

-- CreateIndex
CREATE INDEX "Document_noticeId_idx" ON "Document"("noticeId");

-- CreateIndex
CREATE INDEX "Document_resolutionId_idx" ON "Document"("resolutionId");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE INDEX "Candidate_verifiedById_idx" ON "Candidate"("verifiedById");

-- CreateIndex
CREATE INDEX "Payment_verifiedById_idx" ON "Payment"("verifiedById");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElectionResult" ADD CONSTRAINT "ElectionResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "Resolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
