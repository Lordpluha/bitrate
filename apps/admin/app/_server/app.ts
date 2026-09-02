import { createApp, createIdentityProvider } from '@kottster/server'
import schema from '../../kottster-app.json'

/**
 * Fails at startup rather than falling back to a default. A silent default here would be a
 * credential, and the previous literals in this file — tracked in a public repository — are
 * exactly the failure this guards against.
 */
function requireEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required to start the admin panel.`)
  }

  return value
}

export const app = createApp({
  schema,
  secretKey: requireEnv('KOTTSTER_SECRET_KEY'),
  kottsterApiToken: requireEnv('KOTTSTER_API_TOKEN'),

  /*
   * The identity provider configuration.
   * See https://kottster.app/docs/app-configuration/identity-provider
   */
  identityProvider: createIdentityProvider('sqlite', {
    fileName: 'app.db',

    passwordHashAlgorithm: 'bcrypt',
    jwtSecretSalt: requireEnv('KOTTSTER_JWT_SECRET_SALT'),

    /* The root admin user credentials */
    rootUsername: requireEnv('ADMIN_ROOT_USERNAME'),
    rootPassword: requireEnv('ADMIN_ROOT_PASSWORD'),
  }),
})
