-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('DRAFT', 'READY', 'SUBMITTED', 'RELEASED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReleaseCreditRole" AS ENUM ('PERFORMER', 'PRODUCER', 'COMPOSER', 'LYRICIST', 'OTHER');

-- CreateEnum
CREATE TYPE "ReleaseRightType" AS ENUM ('RECORDING', 'COMPOSITION');

-- CreateTable
CREATE TABLE "Release" (
    "id" UUID NOT NULL,
    "ownerArtistId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AlbumType" NOT NULL DEFAULT 'SINGLE',
    "status" "ReleaseStatus" NOT NULL DEFAULT 'DRAFT',
    "upc" VARCHAR(13),
    "scheduledAt" TIMESTAMPTZ(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseTerritory" (
    "releaseId" UUID NOT NULL,
    "countryCode" CHAR(2) NOT NULL,

    CONSTRAINT "ReleaseTerritory_pkey" PRIMARY KEY ("releaseId","countryCode")
);

-- CreateTable
CREATE TABLE "ReleaseTrack" (
    "releaseId" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ReleaseTrack_pkey" PRIMARY KEY ("releaseId","trackId")
);

-- CreateTable
CREATE TABLE "ReleaseContributor" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "artistId" UUID,
    "displayName" TEXT NOT NULL,
    "roles" "ReleaseCreditRole"[],

    CONSTRAINT "ReleaseContributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseSplit" (
    "releaseId" UUID NOT NULL,
    "contributorId" UUID NOT NULL,
    "rightType" "ReleaseRightType" NOT NULL,
    "shareBasisPoints" INTEGER NOT NULL,

    CONSTRAINT "ReleaseSplit_pkey" PRIMARY KEY ("releaseId","contributorId","rightType")
);

-- CreateIndex
CREATE UNIQUE INDEX "Release_upc_key" ON "Release"("upc");

-- CreateIndex
CREATE INDEX "Release_ownerArtistId_deletedAt_createdAt_idx" ON "Release"("ownerArtistId", "deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Release_status_scheduledAt_idx" ON "Release"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "ReleaseTrack_trackId_idx" ON "ReleaseTrack"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseTrack_releaseId_position_key" ON "ReleaseTrack"("releaseId", "position");

-- CreateIndex
CREATE INDEX "ReleaseContributor_releaseId_idx" ON "ReleaseContributor"("releaseId");

-- CreateIndex
CREATE INDEX "ReleaseContributor_artistId_idx" ON "ReleaseContributor"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseContributor_id_releaseId_key" ON "ReleaseContributor"("id", "releaseId");

-- CreateIndex
CREATE INDEX "ReleaseSplit_contributorId_releaseId_idx" ON "ReleaseSplit"("contributorId", "releaseId");

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_ownerArtistId_fkey" FOREIGN KEY ("ownerArtistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTerritory" ADD CONSTRAINT "ReleaseTerritory_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseContributor" ADD CONSTRAINT "ReleaseContributor_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseContributor" ADD CONSTRAINT "ReleaseContributor_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseSplit" ADD CONSTRAINT "ReleaseSplit_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseSplit" ADD CONSTRAINT "ReleaseSplit_contributorId_releaseId_fkey" FOREIGN KEY ("contributorId", "releaseId") REFERENCES "ReleaseContributor"("id", "releaseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drafts can be incomplete; individual entries must still be structurally valid.
-- Cross-row split totals and submission prerequisites belong to the transactional service.
ALTER TABLE "Release" ADD CONSTRAINT "Release_title_not_blank" CHECK (length(btrim("title")) > 0);
ALTER TABLE "ReleaseTerritory" ADD CONSTRAINT "ReleaseTerritory_country_code_format" CHECK ("countryCode" ~ '^[A-Z]{2}$');
ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_position_nonnegative" CHECK ("position" >= 0);
ALTER TABLE "ReleaseContributor" ADD CONSTRAINT "ReleaseContributor_name_not_blank" CHECK (length(btrim("displayName")) > 0);
ALTER TABLE "ReleaseContributor" ADD CONSTRAINT "ReleaseContributor_roles_required" CHECK ("roles" IS NOT NULL AND cardinality("roles") > 0);
ALTER TABLE "ReleaseSplit" ADD CONSTRAINT "ReleaseSplit_share_bounds" CHECK ("shareBasisPoints" > 0 AND "shareBasisPoints" <= 10000);
