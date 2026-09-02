import { KnexPgAdapter } from '@kottster/server'
import knex from 'knex'

/**
 * Reads the same `DATABASE_URL` the API and the compose stacks already provide, instead of
 * repeating host, user, and password as literals. The previous literals were tracked in a
 * public repository and must be treated as compromised.
 *
 * Learn more at https://knexjs.org/guide/#configuration-options
 */
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required. The admin panel talks to Postgres directly and has no fallback.',
  )
}

const client = knex({
  client: 'pg',
  connection: connectionString,
  searchPath: ['public'],
})

export default new KnexPgAdapter(client)
