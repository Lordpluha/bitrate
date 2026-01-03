import { createApp, createIdentityProvider } from '@kottster/server';
import schema from '../../kottster-app.json';

/* 
 * For security, consider moving the secret data to environment variables.
 * See https://kottster.app/docs/deploying#before-you-deploy
 */
export const app = createApp({
  schema,
  secretKey: 'wyCD0GNSRqScABAK_SjjO0idlkAw0dwO',
  kottsterApiToken: 'YWxSGUFSJnICwTJxUbAJQj5UQ1gLxRlL',

  /*
   * The identity provider configuration.
   * See https://kottster.app/docs/app-configuration/identity-provider
   */
  identityProvider: createIdentityProvider('sqlite', {
    fileName: 'app.db',

    passwordHashAlgorithm: 'bcrypt',
    jwtSecretSalt: '8GMI_rVRHyGoRO3m',
    
    /* The root admin user credentials */
    rootUsername: 'admin',
    rootPassword: 'admin',
  }),
});