-- CreateEnum
CREATE TYPE "ReleaseChangeField" AS ENUM ('RELEASE_TITLE', 'RELEASE_COVER', 'RECORDING_TITLE');

-- CreateEnum
CREATE TYPE "ReleaseChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'CANCELLED');

-- CreateTable
CREATE TABLE "ReleaseChangeRequest" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "message" TEXT,
    "closedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseChange" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "field" "ReleaseChangeField" NOT NULL,
    "draftId" UUID,
    "pendingTarget" TEXT,
    "previousValue" TEXT,
    "proposedValue" TEXT NOT NULL,
    "status" "ReleaseChangeStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "staffId" UUID,
    "decidedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReleaseChangeRequest_releaseId_createdAt_idx" ON "ReleaseChangeRequest"("releaseId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ReleaseChangeRequest_closedAt_createdAt_idx" ON "ReleaseChangeRequest"("closedAt", "createdAt");

-- CreateIndex
CREATE INDEX "ReleaseChange_requestId_idx" ON "ReleaseChange"("requestId");

-- CreateIndex
CREATE INDEX "ReleaseChange_draftId_idx" ON "ReleaseChange"("draftId");

-- CreateIndex
CREATE INDEX "ReleaseChange_staffId_idx" ON "ReleaseChange"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseChange_releaseId_pendingTarget_key" ON "ReleaseChange"("releaseId", "pendingTarget");

-- AddForeignKey
ALTER TABLE "ReleaseChangeRequest" ADD CONSTRAINT "ReleaseChangeRequest_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseChange" ADD CONSTRAINT "ReleaseChange_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ReleaseChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseChange" ADD CONSTRAINT "ReleaseChange_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseChange" ADD CONSTRAINT "ReleaseChange_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ArtistTrackDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseChange" ADD CONSTRAINT "ReleaseChange_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

