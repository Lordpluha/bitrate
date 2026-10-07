-- Soft-deleted rows free their identifiers.
-- DropIndex
DROP INDEX "ArtistTrackDraft_isrc_key";

-- DropIndex
DROP INDEX "Release_upc_key";

-- A UPC-A and its EAN-13 spelling are one GTIN; store every barcode as GTIN-13.
ALTER TABLE "Release" DROP CONSTRAINT "Release_upc_format";
UPDATE "Release" SET "upc" = '0' || "upc" WHERE length("upc") = 12;
ALTER TABLE "Release" ADD CONSTRAINT "Release_upc_format"
  CHECK ("upc" ~ '^[0-9]{13}$');

-- CreateIndex
CREATE UNIQUE INDEX "ArtistTrackDraft_isrc_key" ON "ArtistTrackDraft"("isrc") WHERE ("deletedAt" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "Release_upc_key" ON "Release"("upc") WHERE ("deletedAt" IS NULL);
