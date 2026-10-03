-- Remove the unused resource type metadata. Resource links are identified by title and URL.
ALTER TABLE "event_resources" DROP COLUMN "type";

DROP TYPE "ResourceType";
