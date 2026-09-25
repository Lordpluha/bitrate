import { resolveDeletedAtForUpdate } from './fixture-helpers'
import type { AdminFixturesPrismaClient, AdminFixturesSummary, FixtureUserIds } from './types'

/** Input to {@link upsertUser} — always the row's intended, create-time shape. */
type UpsertUserInput = {
  email: string
  username: string
  deletedAt: Date | null
}

/**
 * Create-only for `username` — an `email`-keyed upsert that also wrote `username` on update
 * risks a unique-constraint conflict if a row's username were ever reassigned across fixtures.
 * `deletedAt` only moves forward, through {@link resolveDeletedAtForUpdate}, so a re-run never
 * resurrects an account an operator deactivated by hand through the panel.
 */
async function upsertUser(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  input: UpsertUserInput,
): Promise<{ id: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  const user = await prisma.user.upsert({
    where: { email: input.email },
    create: input,
    update: {
      deletedAt: resolveDeletedAtForUpdate(existing?.deletedAt ?? null, input.deletedAt),
    },
  })
  if (!existing) summary.users += 1
  return user
}

/** One active reporter and three deactivated listener accounts. */
export async function seedUsers(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
): Promise<FixtureUserIds> {
  const reporter = await upsertUser(prisma, summary, {
    email: 'fixture-reporter@bitrate.fixture',
    username: 'fixture-reporter',
    deletedAt: null,
  })

  const deactivatedUserIds: string[] = []
  for (let index = 1; index <= 3; index += 1) {
    const user = await upsertUser(prisma, summary, {
      email: `fixture-deactivated-user-${index}@bitrate.fixture`,
      username: `fixture-deactivated-user-${index}`,
      deletedAt: new Date(),
    })
    deactivatedUserIds.push(user.id)
  }

  return { reporterUserId: reporter.id, deactivatedUserIds }
}
