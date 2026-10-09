-- AlterTable
ALTER TABLE "ArtistTrackDraft" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- Existing recordings keep their upload order.
UPDATE "ArtistTrackDraft" AS draft
SET "position" = ordered.rank
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "releaseId" ORDER BY "createdAt", "id") - 1 AS rank
  FROM "ArtistTrackDraft"
  WHERE "releaseId" IS NOT NULL
) AS ordered
WHERE draft."id" = ordered."id";
