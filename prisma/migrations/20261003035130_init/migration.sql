/*
  Warnings:

  - You are about to drop the column `details` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `fee` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `maxSeats` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `registrationDeadline` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `registrationRequired` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "details",
DROP COLUMN "fee",
DROP COLUMN "maxSeats",
DROP COLUMN "registrationDeadline",
DROP COLUMN "registrationRequired";
