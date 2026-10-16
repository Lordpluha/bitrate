-- Preparation tasks on a release. Additive: a new enum and table only.

-- CreateEnum
CREATE TYPE "ReleaseTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "ReleaseTask" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ReleaseTaskStatus" NOT NULL DEFAULT 'TODO',
    "dueAt" TIMESTAMPTZ(3),
    "assigneeContributorId" UUID,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReleaseTask_releaseId_status_dueAt_idx" ON "ReleaseTask"("releaseId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "ReleaseTask_assigneeContributorId_idx" ON "ReleaseTask"("assigneeContributorId");

-- AddForeignKey
ALTER TABLE "ReleaseTask" ADD CONSTRAINT "ReleaseTask_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTask" ADD CONSTRAINT "ReleaseTask_assigneeContributorId_fkey" FOREIGN KEY ("assigneeContributorId") REFERENCES "ReleaseContributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
