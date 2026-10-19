import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createWriteOwnershipRule } from '../prisma-write-ownership.mjs'

const here = dirname(fileURLToPath(import.meta.url))

/** The ownership rule wired to the fixture schema, owners and baseline. */
export default {
  meta: { name: 'bitrate-api' },
  rules: {
    'prisma-write-ownership': createWriteOwnershipRule({
      srcRoot: join(here, 'src'),
      schemaPath: join(here, 'schema.prisma'),
      owners: { track: ['tracks'], album: ['albums'], searchHistory: ['search'] },
      baseline: {
        'modules/admin/tracks/baselined.ts': { track: 1 },
        'modules/history/stale.ts': { searchHistory: 2 },
      },
    }),
  },
}
