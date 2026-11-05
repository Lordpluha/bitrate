-- CreateEnum
CREATE TYPE "ArtistWorkspacePage" AS ENUM ('DASHBOARD', 'ANALYTICS', 'RELEASE_DRAFT');

-- CreateTable
CREATE TABLE "ArtistWorkspaceLayout" (
    "artistId" UUID NOT NULL,
    "page" "ArtistWorkspacePage" NOT NULL,
    "tiles" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistWorkspaceLayout_pkey" PRIMARY KEY ("artistId","page")
);

-- AddForeignKey
ALTER TABLE "ArtistWorkspaceLayout" ADD CONSTRAINT "ArtistWorkspaceLayout_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
