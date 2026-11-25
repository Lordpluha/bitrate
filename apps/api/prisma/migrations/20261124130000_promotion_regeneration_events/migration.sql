-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "promotionEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PromotionPlanStep" ADD COLUMN     "regenerating" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "regenerationFailure" TEXT;

-- CreateTable
CREATE TABLE "PromotionEvent" (
    "id" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "subjectId" UUID NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromotionEvent_artistId_createdAt_idx" ON "PromotionEvent"("artistId", "createdAt");

-- CreateIndex
CREATE INDEX "PromotionEvent_name_createdAt_idx" ON "PromotionEvent"("name", "createdAt");

-- AddForeignKey
ALTER TABLE "PromotionEvent" ADD CONSTRAINT "PromotionEvent_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
