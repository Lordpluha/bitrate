-- Per-attempt processing log for the audio-processing pipeline (ADR-0040). One row per
-- BullMQ attempt; successes are compact, failures carry redacted step/error detail.
--
-- NOTE: `prisma migrate diff` also proposed dropping Album_title_trgm_idx,
-- Artist_username_trgm_idx, Playlist_title_trgm_idx and Track_title_trgm_idx. Those are GIN
-- trigram indexes created by raw SQL in 20260811120000_backend_platform_foundation and back
-- search; schema.prisma cannot express a GIN trigram index, so Prisma reads them as drift on
-- every generated migration. The DROPs were removed by hand. Check for them in every future
-- generated migration.

-- CreateEnum
CREATE TYPE "TrackProcessingTrigger" AS ENUM ('UPLOAD', 'REPLACE', 'REPROCESS');

-- CreateEnum
CREATE TYPE "TrackProcessingAttemptStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED', 'SUPERSEDED', 'STALLED');

-- CreateEnum
CREATE TYPE "TrackProcessingStep" AS ENUM ('CLAIM', 'PREPARE_TEMP', 'PROGRESSIVE_ENCODE', 'HLS_ENCODE', 'HLS_VALIDATE', 'CMAF_ENCODE', 'UPLOAD', 'PUBLISH', 'CLEANUP');

-- CreateEnum
CREATE TYPE "TrackProcessingErrorCode" AS ENUM ('FFMPEG_EXIT', 'FFMPEG_SIGNAL', 'TIMEOUT', 'INVALID_INPUT', 'EMPTY_OUTPUT', 'STORAGE', 'DATABASE', 'STALLED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "TrackProcessingAttempt" (
    "id" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "sourceFileName" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "maxAttempts" INTEGER NOT NULL,
    "trigger" "TrackProcessingTrigger" NOT NULL,
    "status" "TrackProcessingAttemptStatus" NOT NULL DEFAULT 'RUNNING',
    "willRetry" BOOLEAN NOT NULL DEFAULT false,
    "deadLetterJobId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "lastProgress" INTEGER NOT NULL DEFAULT 0,
    "failedStep" "TrackProcessingStep",
    "stepDetail" TEXT,
    "errorCode" "TrackProcessingErrorCode",
    "errorName" TEXT,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "retryable" BOOLEAN,
    "commandSummary" TEXT,
    "stderrTail" TEXT,
    "exitCode" INTEGER,
    "signal" TEXT,
    "inputBytes" INTEGER,
    "inputCodec" TEXT,
    "inputContainer" TEXT,
    "inputBitrateKbps" INTEGER,
    "inputDurationSec" INTEGER,
    "workerHost" TEXT NOT NULL,
    "workerPid" INTEGER NOT NULL,
    "workerRelease" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackProcessingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackProcessingAttempt_trackId_startedAt_idx" ON "TrackProcessingAttempt"("trackId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "TrackProcessingAttempt_jobId_attempt_idx" ON "TrackProcessingAttempt"("jobId", "attempt");

-- AddForeignKey
ALTER TABLE "TrackProcessingAttempt" ADD CONSTRAINT "TrackProcessingAttempt_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
