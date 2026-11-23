-- CreateEnum
CREATE TYPE "PromotionGenerationStatus" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "PromotionTranslationState" AS ENUM ('TRANSLATING', 'MACHINE', 'EDITED', 'STALE', 'FAILED');

-- AlterTable
ALTER TABLE "PromotionPlanStep" ADD COLUMN     "postsFailure" TEXT,
ADD COLUMN     "postsStatus" "PromotionGenerationStatus";

-- CreateTable
CREATE TABLE "PromotionPost" (
    "id" UUID NOT NULL,
    "stepId" UUID NOT NULL,
    "channel" "PromotionChannel" NOT NULL,
    "text" TEXT NOT NULL,
    "hashtags" TEXT[],
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PromotionPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionPostTranslation" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "language" VARCHAR(8) NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "state" "PromotionTranslationState" NOT NULL DEFAULT 'TRANSLATING',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "rating" INTEGER,
    "sourceRevision" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PromotionPostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotionPost_stepId_channel_key" ON "PromotionPost"("stepId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionPostTranslation_postId_language_key" ON "PromotionPostTranslation"("postId", "language");

-- AddForeignKey
ALTER TABLE "PromotionPost" ADD CONSTRAINT "PromotionPost_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "PromotionPlanStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionPostTranslation" ADD CONSTRAINT "PromotionPostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PromotionPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

