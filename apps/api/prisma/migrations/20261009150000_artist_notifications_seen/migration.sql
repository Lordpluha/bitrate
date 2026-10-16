-- Unread marker for the artist notification center, kept apart from "Artist". Additive: a
-- missing row means everything currently derived reads as unread until the center is opened.

-- CreateTable
CREATE TABLE "ArtistNotificationState" (
    "artistId" UUID NOT NULL,
    "seenAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ArtistNotificationState_pkey" PRIMARY KEY ("artistId")
);

-- AddForeignKey
ALTER TABLE "ArtistNotificationState" ADD CONSTRAINT "ArtistNotificationState_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
