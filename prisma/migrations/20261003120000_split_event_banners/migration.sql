ALTER TABLE "events" ADD COLUMN "cardBannerUrl" TEXT;
ALTER TABLE "events" ADD COLUMN "detailBannerUrl" TEXT;

UPDATE "events"
SET "cardBannerUrl" = "bannerUrl",
    "detailBannerUrl" = "bannerUrl"
WHERE "bannerUrl" IS NOT NULL;

ALTER TABLE "events" DROP COLUMN "bannerUrl";