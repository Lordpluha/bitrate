-- Release publishing on Bitrate: new lifecycle states and listener visibility.
ALTER TYPE "ReleaseStatus" ADD VALUE 'SCHEDULED';
ALTER TYPE "ReleaseStatus" ADD VALUE 'PUBLISHING';
ALTER TYPE "ReleaseStatus" ADD VALUE 'PUBLISH_FAILED';
ALTER TYPE "ReleaseStatus" ADD VALUE 'UNPUBLISHED';

-- CreateEnum
CREATE TYPE "ReleaseUnpublishedBy" AS ENUM ('ARTIST', 'ADMIN');

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "albumId" UUID,
ADD COLUMN     "publishedAt" TIMESTAMPTZ(3),
ADD COLUMN     "unpublishedBy" "ReleaseUnpublishedBy";

-- CreateIndex
CREATE UNIQUE INDEX "Release_albumId_key" ON "Release"("albumId");

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- The existing catalogue stays public: backfill from creation time, then default new rows to
-- their creation time so uploads outside the release workflow keep their current behavior.
ALTER TABLE "Track" ADD COLUMN     "publishedAt" TIMESTAMPTZ(3);
UPDATE "Track" SET "publishedAt" = "createdAt";
ALTER TABLE "Track" ALTER COLUMN "publishedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Album" ADD COLUMN     "publishedAt" TIMESTAMPTZ(3);
UPDATE "Album" SET "publishedAt" = "createdAt";
ALTER TABLE "Album" ALTER COLUMN "publishedAt" SET DEFAULT CURRENT_TIMESTAMP;
