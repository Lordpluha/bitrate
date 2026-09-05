/**
 * Applies the environment defaults the API relies on at runtime.
 *
 * `env.schema.ts` declares defaults for the cookie names, but those are filled
 * in when the app boots and parses its environment. Integration specs build a
 * TestingModule directly and skip that step, so controllers reading
 * `process.env.ACCESS_TOKEN_NAME` would otherwise index a request by
 * `undefined`.
 */
process.env.ACCESS_TOKEN_NAME ??= 'access_token'
process.env.REFRESH_TOKEN_NAME ??= 'refresh_token'
