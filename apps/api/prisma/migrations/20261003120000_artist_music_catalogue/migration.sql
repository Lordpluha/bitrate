CREATE TYPE "ArtistTrackStatus" AS ENUM ('DRAFT', 'PROCESSING', 'READY', 'NEEDS_CHANGES', 'PUBLISHED', 'UPLOAD_FAILED');
CREATE TYPE "ArtistTrackVersion" AS ENUM ('ORIGINAL', 'REMASTER', 'LIVE', 'DEMO');

ALTER TABLE "Release" ADD COLUMN "cover" TEXT,
    ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "Release_id_ownerArtistId_key" ON "Release"("id", "ownerArtistId");

CREATE TABLE "ArtistTrackDraft" (
    "id" UUID NOT NULL,
    "ownerArtistId" UUID NOT NULL,
    "releaseId" UUID,
    "title" TEXT NOT NULL,
    "version" "ArtistTrackVersion" NOT NULL DEFAULT 'ORIGINAL',
    "status" "ArtistTrackStatus" NOT NULL DEFAULT 'DRAFT',
    "duration" INTEGER,
    "cover" TEXT,
    "previewUrl" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArtistTrackDraft_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ArtistTrackDraft_duration_check" CHECK ("duration" IS NULL OR "duration" >= 0)
);

CREATE INDEX "ArtistTrackDraft_ownerArtistId_deletedAt_updatedAt_idx" ON "ArtistTrackDraft"("ownerArtistId", "deletedAt", "updatedAt" DESC);
CREATE INDEX "ArtistTrackDraft_releaseId_idx" ON "ArtistTrackDraft"("releaseId");
ALTER TABLE "ArtistTrackDraft" ADD CONSTRAINT "ArtistTrackDraft_ownerArtistId_fkey" FOREIGN KEY ("ownerArtistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ArtistTrackDraft" ADD CONSTRAINT "ArtistTrackDraft_releaseId_ownerArtistId_fkey" FOREIGN KEY ("releaseId", "ownerArtistId") REFERENCES "Release"("id", "ownerArtistId") ON DELETE RESTRICT ON UPDATE CASCADE;
