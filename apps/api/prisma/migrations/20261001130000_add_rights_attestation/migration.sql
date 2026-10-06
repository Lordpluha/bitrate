-- Records the Artist Agreement revision under which an artist confirmed they hold the rights to a
-- track or album, and when. Nullable: content created before the confirmation was recorded keeps NULL.

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "rightsConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "rightsConfirmedVersion" TEXT;

-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "rightsConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "rightsConfirmedVersion" TEXT;
