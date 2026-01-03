import { KnexPgAdapter } from '@kottster/server';
import knex from 'knex';

/**
 * Learn more at https://knexjs.org/guide/#configuration-options
 */
const client = knex({
  client: 'pg', 
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin',
    database: 'spotify',
    ssl: false
  },
  searchPath: ['public']
});

export default new KnexPgAdapter(client);