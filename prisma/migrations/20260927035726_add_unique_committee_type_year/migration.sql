/*
  Warnings:

  - A unique constraint covering the columns `[type,year]` on the table `committees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "committees_year_key";

-- CreateIndex
CREATE UNIQUE INDEX "committees_type_year_key" ON "committees"("type", "year");
