import './bootstrap-env'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { ensureBuiltInRoles } from './built-in-roles'
import { assertAllowedEnvironment } from './seed-admin.guard'
import { AdminFixturesSeeder } from './seeders/admin-fixtures.seeder'

/**
 * Fixture data for the admin panel: stuck/failed tracks, moderation reports across every status
 * and entity type, deactivated users/artists, an unreferenced genre, extra staff and roles, and
 * enough audit history for a "recent actions" list — everything the panel's coverage specs are
 * verified against.
 *
 * Sibling of `seed-staff.ts`: additive, safe to re-run, and never calls
 * `SeedService.clearDatabase`. Requires the base catalog (`pnpm --filter @bitrate/api db:seed`)
 * to have already created at least one artist and one track.
 *
 * The environment guard lives in `seed-admin.guard.ts` — see it for the exact rule. This module
 * only runs `main()` when executed directly (`require.main === module`), never on import, so a
 * spec can import the guard through this file's sibling without triggering a live seed run.
 *
 *     pnpm --filter @bitrate/api db:seed:admin
 */
async function main(): Promise<void> {
  assertAllowedEnvironment()

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    await ensureBuiltInRoles(prisma)

    const seeder = new AdminFixturesSeeder(prisma)
    const summary = await seeder.run()

    console.log('✅ Admin-panel fixtures seeded (rows created this run, 0 means already present):')
    for (const [group, count] of Object.entries(summary)) {
      console.log(`  ${group}: ${count}`)
    }
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

/**
 * `require.main === module` is only true when this file is the process entrypoint (`node
 * seed-admin.js` / `ts-node seed-admin.ts`), never when another module — including a spec —
 * imports it. Without this guard, `import { assertAllowedEnvironment } from './seed-admin'`
 * would run `main()` as a side effect of the import itself.
 */
if (require.main === module) {
  main().catch((error: unknown) => {
    console.error('Failed to seed admin-panel fixtures:', error)
    process.exit(1)
  })
}
