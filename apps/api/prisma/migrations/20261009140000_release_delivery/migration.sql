-- Delivery plan and partner-reported delivery state. Additive: new enums and tables only.

-- CreateEnum
CREATE TYPE "DeliveryDestination" AS ENUM ('SPOTIFY', 'APPLE_MUSIC', 'YOUTUBE_MUSIC', 'AMAZON_MUSIC', 'DEEZER', 'TIDAL');

-- CreateEnum
CREATE TYPE "DeliveryState" AS ENUM ('SUBMITTED', 'ACCEPTED', 'LIVE', 'FAILED', 'TAKEN_DOWN');

-- CreateTable
CREATE TABLE "ReleaseDestination" (
    "releaseId" UUID NOT NULL,
    "destination" "DeliveryDestination" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseDestination_pkey" PRIMARY KEY ("releaseId","destination")
);

-- CreateTable
CREATE TABLE "ReleaseDelivery" (
    "releaseId" UUID NOT NULL,
    "destination" "DeliveryDestination" NOT NULL,
    "state" "DeliveryState" NOT NULL,
    "externalId" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseDelivery_pkey" PRIMARY KEY ("releaseId","destination")
);

-- CreateIndex
CREATE INDEX "ReleaseDelivery_state_idx" ON "ReleaseDelivery"("state");

-- AddForeignKey
ALTER TABLE "ReleaseDestination" ADD CONSTRAINT "ReleaseDestination_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseDelivery" ADD CONSTRAINT "ReleaseDelivery_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
