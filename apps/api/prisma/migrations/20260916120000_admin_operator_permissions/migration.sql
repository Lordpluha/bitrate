-- Operator authorisation, stage B1: permissions live on the staff member (`Staff.permissions`);
-- a `Role` is a template copied onto a staff member at assignment time, kept afterwards only as
-- provenance/display via `Staff.roleId`. Replaces the `StaffRole` enum.
--
-- NOTE: `prisma migrate diff` also proposed dropping Album_title_trgm_idx,
-- Artist_username_trgm_idx, Playlist_title_trgm_idx and Track_title_trgm_idx. Those are GIN
-- trigram indexes created by raw SQL in 20260811120000_backend_platform_foundation and back
-- search; schema.prisma cannot express a GIN trigram index, so Prisma reads them as drift on
-- every generated migration. The DROPs were removed by hand. Check for them in every future
-- generated migration.

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "builtIn" BOOLEAN NOT NULL DEFAULT false,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- Seed the two built-in roles. ADMIN is a super-role by identity (builtIn && name = 'ADMIN')
-- and its own `permissions` array is stored empty and meaningless — see AdminAuthGuard /
-- hasPermission(). MODERATOR's array mirrors MODERATOR_TEMPLATE in
-- apps/api/src/modules/admin-auth/access/permissions.ts (every permission minus
-- PROTECTED_PERMISSIONS); a unit pin test checks the code side stays in sync with this list.
INSERT INTO "Role" ("id", "name", "description", "builtIn", "permissions")
VALUES
  (
    gen_random_uuid(),
    'ADMIN',
    'Built-in super role. Passes every permission check by identity; its own permissions are not consulted.',
    true,
    ARRAY[]::TEXT[]
  ),
  (
    gen_random_uuid(),
    'MODERATOR',
    'Built-in operator role. Holds every grantable permission except staff and role administration.',
    true,
    ARRAY[
      'reports:read', 'reports:advance',
      'artists:read', 'artists:verify', 'artists:delete',
      'tracks:read', 'tracks:reprocess',
      'users:read', 'users:delete',
      'audit:read'
    ]::TEXT[]
  );

-- AlterTable: roleId starts nullable and permissions starts empty so the backfill below can run
-- before either column is constrained.
ALTER TABLE "Staff" ADD COLUMN "roleId" UUID;
ALTER TABLE "Staff" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill roleId from the old `role` enum column.
UPDATE "Staff" AS s
SET "roleId" = r."id"
FROM "Role" AS r
WHERE r."name" = s."role"::TEXT;

-- Backfill permissions to match each operator's role template. This step must not be skipped:
-- without it every existing moderator deploys with zero access, and nothing else — not lint,
-- not types, not the unit suite — would notice.
UPDATE "Staff"
SET "permissions" = ARRAY[
  'reports:read', 'reports:advance',
  'artists:read', 'artists:verify', 'artists:delete',
  'tracks:read', 'tracks:reprocess',
  'users:read', 'users:delete',
  'audit:read'
]::TEXT[]
WHERE "role" = 'MODERATOR';

UPDATE "Staff"
SET "permissions" = ARRAY[]::TEXT[]
WHERE "role" = 'ADMIN';

-- Now that every row has a roleId, make it required and drop the old column/enum.
ALTER TABLE "Staff" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "Staff" DROP COLUMN "role";
DROP TYPE "StaffRole";

-- CreateIndex
CREATE INDEX "Staff_roleId_idx" ON "Staff"("roleId");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
