-- CreateEnum
CREATE TYPE "AiCallOutcome" AS ENUM ('SUCCEEDED', 'FAILED', 'REJECTED_SCHEMA', 'REJECTED_UNGROUNDED');

-- CreateTable
CREATE TABLE "AiUsage" (
    "id" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "feature" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "cachedInputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL,
    "costMicroUsd" INTEGER NOT NULL,
    "outcome" "AiCallOutcome" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsage_artistId_createdAt_idx" ON "AiUsage"("artistId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
