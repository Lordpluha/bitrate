-- CreateEnum
CREATE TYPE "ArtistNotificationCategory" AS ENUM ('TASKS', 'REVIEW', 'DELIVERY');

-- CreateTable
CREATE TABLE "ArtistNotificationPreference" (
    "artistId" UUID NOT NULL,
    "mutedInApp" "ArtistNotificationCategory"[] DEFAULT ARRAY[]::"ArtistNotificationCategory"[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistNotificationPreference_pkey" PRIMARY KEY ("artistId")
);

-- AddForeignKey
ALTER TABLE "ArtistNotificationPreference" ADD CONSTRAINT "ArtistNotificationPreference_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
