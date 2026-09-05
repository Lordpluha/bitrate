-- Single-file CMAF + Range playback index (ADR-0020).
--
-- The pg_trgm GIN indexes created in 20260811120000 are intentionally NOT dropped
-- here. Prisma proposes dropping them on every migrate because they are declared in
-- raw SQL rather than in schema.prisma; removing them would silently degrade search.

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "durationTicks" INTEGER,
ADD COLUMN     "fragmentTimescale" INTEGER,
ADD COLUMN     "playbackVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "TrackFile" ADD COLUMN     "fragments" JSONB,
ADD COLUMN     "initRangeEnd" INTEGER,
ADD COLUMN     "initRangeStart" INTEGER;
