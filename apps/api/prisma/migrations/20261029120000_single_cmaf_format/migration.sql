-- ADR-0065: CMAF is the only stored audio format. The data cleanup runs first so the
-- constraints below hold on every environment; production holds no tracks.

-- A ready track without a CMAF rendition has nothing left to play.
UPDATE "Track"
SET "processingStatus" = 'FAILED',
    "processingError" = 'This audio was stored in a retired format. Upload the audio again.',
    "processingFinishedAt" = NOW()
WHERE "processingStatus" = 'READY'
  AND NOT EXISTS (
    SELECT 1 FROM "TrackFile"
    WHERE "TrackFile"."trackId" = "Track"."id" AND "TrackFile"."format" = 'cmaf'
  );

-- Progressive Opus rows; their objects go with the bucket reset.
DELETE FROM "TrackFile" WHERE "format" <> 'cmaf';

-- Attempts that failed in a step that no longer exists.
DELETE FROM "TrackProcessingAttempt"
WHERE "failedStep" IN ('PROGRESSIVE_ENCODE', 'HLS_ENCODE', 'HLS_VALIDATE');

-- AlterEnum
BEGIN;
CREATE TYPE "TrackProcessingStep_new" AS ENUM ('CLAIM', 'PREPARE_TEMP', 'CMAF_ENCODE', 'UPLOAD', 'PUBLISH', 'CLEANUP');
ALTER TABLE "TrackProcessingAttempt" ALTER COLUMN "failedStep" TYPE "TrackProcessingStep_new" USING ("failedStep"::text::"TrackProcessingStep_new");
ALTER TYPE "TrackProcessingStep" RENAME TO "TrackProcessingStep_old";
ALTER TYPE "TrackProcessingStep_new" RENAME TO "TrackProcessingStep";
DROP TYPE "TrackProcessingStep_old";
COMMIT;

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "playbackVersion";

-- AlterTable
ALTER TABLE "TrackFile" ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "initRangeStart" SET NOT NULL,
ALTER COLUMN "initRangeEnd" SET NOT NULL,
ALTER COLUMN "fragments" SET NOT NULL;
