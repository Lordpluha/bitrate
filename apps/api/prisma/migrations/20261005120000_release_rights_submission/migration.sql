-- CreateEnum
CREATE TYPE "ReleaseMasterOwner" AS ENUM ('ARTIST', 'OTHER');

-- AlterTable
ALTER TABLE "ArtistTrackDraft" ADD COLUMN     "isrc" VARCHAR(12);

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "accuracyConfirmedAt" TIMESTAMPTZ(3),
ADD COLUMN     "masterOwnerName" TEXT,
ADD COLUMN     "masterOwnerType" "ReleaseMasterOwner",
ADD COLUMN     "submittedAt" TIMESTAMPTZ(3),
ADD COLUMN     "writersConfirmedAt" TIMESTAMPTZ(3);

-- CreateIndex
CREATE UNIQUE INDEX "ArtistTrackDraft_isrc_key" ON "ArtistTrackDraft"("isrc");

-- Storage invariants; check digits and partner rules are validated by the API.
ALTER TABLE "ArtistTrackDraft" ADD CONSTRAINT "ArtistTrackDraft_isrc_format"
  CHECK ("isrc" ~ '^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$');
ALTER TABLE "Release" ADD CONSTRAINT "Release_upc_format"
  CHECK ("upc" ~ '^[0-9]{12,13}$');
ALTER TABLE "Release" ADD CONSTRAINT "Release_master_owner_name"
  CHECK (
    ("masterOwnerType" = 'OTHER' AND length(btrim("masterOwnerName")) > 0)
    OR ("masterOwnerType" IS DISTINCT FROM 'OTHER' AND "masterOwnerName" IS NULL)
  );
