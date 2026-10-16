-- Private master audio uploaded to a release's track draft. Additive and nullable: existing
-- drafts, including demo rows, keep NULL and simply report that no audio was uploaded yet.

-- AlterTable
ALTER TABLE "ArtistTrackDraft" ADD COLUMN     "audioContentType" TEXT,
ADD COLUMN     "audioFileName" TEXT,
ADD COLUMN     "audioKey" TEXT,
ADD COLUMN     "audioSizeBytes" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ArtistTrackDraft_audioKey_key" ON "ArtistTrackDraft"("audioKey");
