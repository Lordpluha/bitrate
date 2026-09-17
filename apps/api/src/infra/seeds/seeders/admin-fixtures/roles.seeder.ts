import type { AdminFixturesPrismaClient, AdminFixturesSummary, FixtureRoleIds } from './types'

/** Input to {@link upsertRole}. */
type UpsertRoleInput = {
  name: string
  description: string
  permissions: string[]
}

async function upsertRole(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  input: UpsertRoleInput,
): Promise<{ id: string }> {
  const existing = await prisma.role.findUnique({ where: { name: input.name } })
  const role = await prisma.role.upsert({
    where: { name: input.name },
    create: { ...input, builtIn: false },
    update: { description: input.description, permissions: input.permissions },
  })
  if (!existing) summary.roles += 1
  return role
}

/** Two custom fixture roles, one scoped to moderation reports and one to read-only catalog. */
export async function seedRoles(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
): Promise<FixtureRoleIds> {
  const reviewer = await upsertRole(prisma, summary, {
    name: 'Fixture: Reviewer',
    description: 'Fixture custom role — moderation reports only.',
    permissions: ['reports:read', 'reports:advance'],
  })
  const catalog = await upsertRole(prisma, summary, {
    name: 'Fixture: Catalog',
    description: 'Fixture custom role — read-only catalog access plus reprocessing.',
    permissions: ['tracks:read', 'tracks:reprocess', 'artists:read', 'audit:read'],
  })
  return { reviewerRoleId: reviewer.id, catalogRoleId: catalog.id }
}
