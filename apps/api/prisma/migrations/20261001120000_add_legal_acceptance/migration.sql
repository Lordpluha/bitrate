-- Records which revision of the Terms of Use / Privacy Policy (and, for artists, the Artist
-- Agreement) an account accepted at registration, and when. Nullable: accounts created before
-- acceptance was recorded keep NULL and are not asked again yet.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "legalAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "legalVersion" TEXT;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "artistAgreementAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "artistAgreementVersion" TEXT,
ADD COLUMN     "legalAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "legalVersion" TEXT;
