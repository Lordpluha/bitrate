import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type StaffRole } from '@prisma/client'
import * as argon2 from 'argon2'
import { Pool } from 'pg'

/**
 * Creates or updates the operator account the admin panel signs in with.
 *
 * Separate from `seed.ts` on purpose: that one downloads the NCS catalog and generates fifty
 * users, which is not something you want to run to add one row. This is also why the operator is
 * not seeded from a migration — a password in a migration is a password in git history forever.
 *
 * The API deliberately exposes no registration endpoint (see ADR-0035), so this script is the
 * only way the first operator comes into existence. Once one exists, further accounts should be
 * created through the API by an ADMIN rather than by re-running this.
 *
 * Values come from the environment, never from arguments — an argument lands in shell history.
 *
 *     ADMIN_EMAIL=ops@bitrate.me \
 *     ADMIN_USERNAME=ops \
 *     ADMIN_PASSWORD=... \
 *     pnpm --filter @bitrate/api db:seed:staff
 */

const MIN_PASSWORD_LENGTH = 12
const VALID_ROLES: readonly StaffRole[] = ['ADMIN', 'MODERATOR']

type StaffSeedInput = {
  email: string
  username: string
  password: string
  role: StaffRole
}

/** Reads and validates the seed input, or explains exactly what is missing and stops. */
function readInput(): StaffSeedInput {
  const email = process.env.ADMIN_EMAIL?.trim()
  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD
  const role = (process.env.ADMIN_ROLE?.trim() || 'ADMIN') as StaffRole

  const problems: string[] = []

  if (!email) problems.push('ADMIN_EMAIL is not set')
  else if (!email.includes('@')) problems.push('ADMIN_EMAIL is not an email address')

  if (!username) problems.push('ADMIN_USERNAME is not set')

  if (!password) problems.push('ADMIN_PASSWORD is not set')
  else if (password.length < MIN_PASSWORD_LENGTH) {
    problems.push(`ADMIN_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters`)
  }

  if (!VALID_ROLES.includes(role)) {
    problems.push(`ADMIN_ROLE must be one of ${VALID_ROLES.join(', ')} (got "${role}")`)
  }

  if (problems.length > 0) {
    console.error('Cannot seed the operator account:')
    for (const problem of problems) console.error(`  - ${problem}`)
    console.error('\nSet them in apps/api/.env — see apps/api/.env.example.')
    process.exit(1)
  }

  return {
    email: email as string,
    username: username as string,
    password: password as string,
    role,
  }
}

/**
 * Production needs a deliberate act, not a stray `pnpm db:seed:staff` against a `.env` that
 * happens to point at the live database.
 */
function assertAllowedEnvironment(): void {
  if (process.env.NODE_ENV !== 'production') return
  if (process.env.ADMIN_SEED_ALLOW_PRODUCTION === 'true') return

  console.error(
    'Refusing to seed an operator with NODE_ENV=production.\n' +
      'Re-run with ADMIN_SEED_ALLOW_PRODUCTION=true if that is genuinely what you want.',
  )
  process.exit(1)
}

async function main(): Promise<void> {
  assertAllowedEnvironment()

  const { email, username, password, role } = readInput()

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    const hashed = await argon2.hash(password, { type: argon2.argon2id })

    const existing = await prisma.staff.findUnique({ where: { email } })

    const staff = await prisma.staff.upsert({
      where: { email },
      create: { email, username, password: hashed, role },
      /**
       * Re-running with a changed password applies it, and clears any lockout from failed
       * attempts — which is the other reason to reach for this script.
       */
      update: {
        username,
        password: hashed,
        role,
        failedLoginAttempts: 0,
        lockedUntil: null,
        deletedAt: null,
      },
    })

    console.log(
      `${existing ? 'Updated' : 'Created'} operator ${staff.email} (${staff.username}) as ${staff.role}.`,
    )
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((error: unknown) => {
  console.error('Failed to seed the operator account:', error)
  process.exit(1)
})
