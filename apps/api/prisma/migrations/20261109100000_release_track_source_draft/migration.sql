-- Link each published catalogue track to the draft it came from.
ALTER TABLE "ReleaseTrack" ADD COLUMN "draftId" UUID;

-- Backfill: publication numbered live drafts 1..n in (position, createdAt, id) order, so the
-- n-th live draft of a release is the one behind ReleaseTrack.position = n. A reused link must
-- point at the same catalogue track its compilation draft names.
UPDATE "ReleaseTrack" AS rt
SET "draftId" = d.id
FROM (
  SELECT id, "releaseId", "sourceTrackId",
         ROW_NUMBER() OVER (PARTITION BY "releaseId" ORDER BY position, "createdAt", id) AS n
  FROM "ArtistTrackDraft"
  WHERE "deletedAt" IS NULL AND "releaseId" IS NOT NULL
) AS d
WHERE rt."releaseId" = d."releaseId"
  AND rt.position = d.n
  AND (
    (rt.reused AND d."sourceTrackId" = rt."trackId")
    OR (NOT rt.reused AND d."sourceTrackId" IS NULL)
  );

CREATE UNIQUE INDEX "ReleaseTrack_draftId_key" ON "ReleaseTrack"("draftId");

ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_draftId_fkey"
  FOREIGN KEY ("draftId") REFERENCES "ArtistTrackDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
