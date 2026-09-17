import { MODERATOR_TEMPLATE } from '@modules/admin-auth'
import * as argon2 from 'argon2'
import { FIXTURE_PASSWORD } from './constants'
import { resolveDeletedAtForUpdate } from './fixture-helpers'
import type {
  AdminFixturesPrismaClient,
  AdminFixturesSummary,
  FixtureRoleIds,
  FixtureStaffIds,
} from './types'

/** Input to {@link upsertStaff} — always the row's intended, create-time shape. */
type UpsertStaffInput = {
  email: string
  username: string
  password: string
  roleId: string
  permissions: string[]
  deletedAt: Date | null
}

/**
 * Create-only for `password`, `username`, `permissions`, and `roleId` — a re-run never re-hashes
 * a fixture password, never reverts permissions an operator edited by hand to prove the panel
 * reads `Staff.permissions` rather than the role's, and never trips the unique `username`
 * constraint by writing it through an `email`-keyed upsert. Only `deletedAt` moves on a re-run,
 * and only forward through {@link resolveDeletedAtForUpdate} — see there for why.
 */
async function upsertStaff(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  input: UpsertStaffInput,
): Promise<{ id: string }> {
  const existing = await prisma.staff.findUnique({ where: { email: input.email } })
  const staff = await prisma.staff.upsert({
    where: { email: input.email },
    create: input,
    update: {
      deletedAt: resolveDeletedAtForUpdate(existing?.deletedAt ?? null, input.deletedAt),
    },
  })
  if (!existing) summary.staff += 1
  return staff
}

/**
 * Three fixture operators: an active MODERATOR whose held permissions deliberately diverge from
 * the role template, an active custom-role reviewer, and a deactivated MODERATOR.
 */
export async function seedStaff(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  roles: FixtureRoleIds,
): Promise<FixtureStaffIds> {
  const moderatorRole = await prisma.role.findUniqueOrThrow({ where: { name: 'MODERATOR' } })
  const hashed = await argon2.hash(FIXTURE_PASSWORD, { type: argon2.argon2id })

  // A MODERATOR whose held permissions diverge from the role template on purpose — proves the
  // panel reads `Staff.permissions`, not the role's, once a role's current template changes.
  const divergentPermissions = MODERATOR_TEMPLATE.filter(
    (permission) => permission !== 'artists:delete' && permission !== 'tracks:reprocess',
  )

  const moderator = await upsertStaff(prisma, summary, {
    email: 'fixture-moderator@bitrate.fixture',
    username: 'fixture-moderator',
    password: hashed,
    roleId: moderatorRole.id,
    permissions: [...divergentPermissions],
    deletedAt: null,
  })

  await upsertStaff(prisma, summary, {
    email: 'fixture-reviewer@bitrate.fixture',
    username: 'fixture-reviewer',
    password: hashed,
    roleId: roles.reviewerRoleId,
    permissions: ['reports:read', 'reports:advance'],
    deletedAt: null,
  })

  await upsertStaff(prisma, summary, {
    email: 'fixture-deactivated-staff@bitrate.fixture',
    username: 'fixture-deactivated-staff',
    password: hashed,
    roleId: moderatorRole.id,
    permissions: [...MODERATOR_TEMPLATE],
    deletedAt: new Date(),
  })

  return { moderatorStaffId: moderator.id }
}
