CREATE UNIQUE INDEX "ArtistSession_id_artistId_key" ON "ArtistSession"("id", "artistId");
CREATE TABLE "ArtistAccountLink" (
  "browserTokenHash" CHAR(64) NOT NULL,
  "artistId" UUID NOT NULL,
  "sessionId" UUID NOT NULL,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ArtistAccountLink_pkey" PRIMARY KEY ("browserTokenHash", "artistId"),
  CONSTRAINT "ArtistAccountLink_sessionId_artistId_fkey" FOREIGN KEY ("sessionId", "artistId")
    REFERENCES "ArtistSession"("id", "artistId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ArtistAccountLink_sessionId_artistId_idx" ON "ArtistAccountLink"("sessionId", "artistId");
