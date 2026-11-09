ALTER TABLE "ArtistTrackDraft" ADD COLUMN "sourceTrackId" UUID;
ALTER TABLE "ReleaseTrack" ADD COLUMN "reused" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Track" ADD COLUMN "moderationBlockedAt" TIMESTAMPTZ(3);
ALTER TABLE "ArtistTrackDraft" ADD CONSTRAINT "ArtistTrackDraft_sourceTrackId_fkey"
  FOREIGN KEY ("sourceTrackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "ArtistTrackDraft_sourceTrackId_idx" ON "ArtistTrackDraft"("sourceTrackId");
CREATE UNIQUE INDEX "ArtistTrackDraft_active_source_key" ON "ArtistTrackDraft"("releaseId", "sourceTrackId")
  WHERE "deletedAt" IS NULL AND "sourceTrackId" IS NOT NULL;
UPDATE "Track" AS t SET "moderationBlockedAt" = NOW(), "publishedAt" = NULL
WHERE EXISTS (SELECT 1 FROM "ReleaseTrack" rt JOIN "Release" r ON r.id = rt."releaseId"
  WHERE rt."trackId" = t.id AND r."unpublishedBy" = 'ADMIN');
