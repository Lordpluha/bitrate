-- ADR-0077 Phase A: encrypted renditions beside one unencrypted rendition, and per-track content
-- keys stored wrapped. Existing rows are unencrypted, which the column default records.

-- AlterTable
ALTER TABLE "TrackFile" ADD COLUMN     "encrypted" BOOLEAN NOT NULL DEFAULT false;

-- An encrypted and an unencrypted rendition of the same bitrate may now coexist.
DROP INDEX "TrackFile_trackId_format_bitrate_key";
CREATE UNIQUE INDEX "TrackFile_trackId_format_bitrate_encrypted_key" ON "TrackFile"("trackId", "format", "bitrate", "encrypted");

-- CreateTable
CREATE TABLE "TrackContentKey" (
    "trackId" UUID NOT NULL,
    "keyId" TEXT NOT NULL,
    "wrappedKey" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "authTag" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackContentKey_pkey" PRIMARY KEY ("trackId")
);

-- AddForeignKey
ALTER TABLE "TrackContentKey" ADD CONSTRAINT "TrackContentKey_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
