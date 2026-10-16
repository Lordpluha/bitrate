-- Bitrate review decisions on submitted releases. Additive: a new enum and table only.

-- CreateEnum
CREATE TYPE "ReleaseReviewDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED');

-- CreateTable
CREATE TABLE "ReleaseReview" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "staffId" UUID,
    "decision" "ReleaseReviewDecision" NOT NULL,
    "message" TEXT,
    "requiredChanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReleaseReview_releaseId_createdAt_idx" ON "ReleaseReview"("releaseId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReleaseReview_staffId_idx" ON "ReleaseReview"("staffId");

-- AddForeignKey
ALTER TABLE "ReleaseReview" ADD CONSTRAINT "ReleaseReview_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseReview" ADD CONSTRAINT "ReleaseReview_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
