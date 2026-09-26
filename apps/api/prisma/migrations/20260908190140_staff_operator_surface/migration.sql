-- Staff: the operator identity, kept separate from User (ADR-0035).
--
-- NOTE: `prisma migrate dev` also wanted to drop Album_title_trgm_idx, Artist_username_trgm_idx,
-- Playlist_title_trgm_idx and Track_title_trgm_idx. Those are GIN trigram indexes created by raw
-- SQL in 20260811120000_backend_platform_foundation and they back search; schema.prisma cannot
-- express a GIN trigram index, so Prisma reads them as drift on every generated migration.
-- The DROPs were removed by hand. Check for them in every future generated migration.

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'MODERATOR');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "staffId" UUID;

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffSession" (
    "id" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_username_key" ON "Staff"("username");

-- CreateIndex
CREATE INDEX "Staff_email_idx" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_deletedAt_idx" ON "Staff"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaffSession_access_token_key" ON "StaffSession"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "StaffSession_refresh_token_key" ON "StaffSession"("refresh_token");

-- CreateIndex
CREATE INDEX "StaffSession_staffId_idx" ON "StaffSession"("staffId");

-- CreateIndex
CREATE INDEX "StaffSession_access_token_idx" ON "StaffSession"("access_token");

-- CreateIndex
CREATE INDEX "StaffSession_refresh_token_idx" ON "StaffSession"("refresh_token");

-- CreateIndex
CREATE INDEX "AuditLog_staffId_createdAt_idx" ON "AuditLog"("staffId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "StaffSession" ADD CONSTRAINT "StaffSession_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
