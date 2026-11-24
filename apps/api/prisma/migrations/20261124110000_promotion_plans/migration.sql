-- CreateEnum
CREATE TYPE "PromotionGoal" AS ENUM ('STREAMS', 'FOLLOWERS', 'BUZZ');

-- CreateEnum
CREATE TYPE "PromotionChannel" AS ENUM ('INSTAGRAM', 'TIKTOK', 'TELEGRAM', 'YOUTUBE_SHORTS');

-- CreateEnum
CREATE TYPE "PromotionPlanStatus" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "PromotionStepPhase" AS ENUM ('PRE', 'LAUNCH', 'POST');

-- CreateEnum
CREATE TYPE "PromotionStepKind" AS ENUM ('POST', 'FOLLOWER_MESSAGE', 'COUNTDOWN', 'ACTION');

-- CreateEnum
CREATE TYPE "PromotionStepState" AS ENUM ('SUGGESTED', 'APPROVED', 'EDITED', 'REJECTED', 'DONE');

-- CreateTable
CREATE TABLE "ArtistPromotionProfile" (
    "artistId" UUID NOT NULL,
    "goal" "PromotionGoal" NOT NULL,
    "channels" "PromotionChannel"[],
    "weeklyHours" INTEGER NOT NULL,
    "countries" TEXT[],
    "audience" TEXT,
    "voiceWords" TEXT[],
    "voiceExamples" TEXT[],
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ArtistPromotionProfile_pkey" PRIMARY KEY ("artistId")
);

-- CreateTable
CREATE TABLE "PromotionPlan" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "PromotionPlanStatus" NOT NULL DEFAULT 'GENERATING',
    "model" TEXT,
    "failure" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionPlanStep" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "offsetDays" INTEGER NOT NULL,
    "phase" "PromotionStepPhase" NOT NULL,
    "kind" "PromotionStepKind" NOT NULL,
    "channels" "PromotionChannel"[],
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "state" "PromotionStepState" NOT NULL DEFAULT 'SUGGESTED',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PromotionPlanStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionPlan_releaseId_version_key" ON "PromotionPlan"("releaseId", "version");

-- CreateIndex
CREATE INDEX "PromotionPlanStep_planId_position_idx" ON "PromotionPlanStep"("planId", "position");

-- AddForeignKey
ALTER TABLE "ArtistPromotionProfile" ADD CONSTRAINT "ArtistPromotionProfile_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionPlan" ADD CONSTRAINT "PromotionPlan_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionPlanStep" ADD CONSTRAINT "PromotionPlanStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PromotionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

