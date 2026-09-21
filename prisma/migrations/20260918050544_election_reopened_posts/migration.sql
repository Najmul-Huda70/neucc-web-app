-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "reopenedPostIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
