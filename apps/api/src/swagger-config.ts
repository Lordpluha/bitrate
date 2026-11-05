import type { ApiSurface } from '@common/config'
import { API_DOC_DESCRIPTION, API_DOC_TITLE, API_DOC_VERSION } from '@common/swagger'
import { SESSION_COOKIE_NAMES, type SessionAudience } from '@modules/tokens'
import { HttpStatus } from '@nestjs/common'
import { DocumentBuilder, type OpenAPIObject } from '@nestjs/swagger'

/** The sessions each surface authenticates, so a document lists only the cookies its routes read. */
const SURFACE_AUDIENCES: Record<ApiSurface, readonly SessionAudience[]> = {
  public: ['user', 'artist'],
  admin: ['staff'],
}

const SURFACE_DOC_TITLES: Record<ApiSurface, string> = {
  public: API_DOC_TITLE,
  admin: `${API_DOC_TITLE} — operators`,
}

const SURFACE_DOC_DESCRIPTIONS: Record<ApiSurface, string> = {
  public: API_DOC_DESCRIPTION,
  admin: 'HTTP API of the Bitrate operator panel — moderation, catalogue and staff administration.',
}

/** Server-wide errors every operation can answer, listed once instead of on each route. */
const GLOBAL_RESPONSES: readonly { status: HttpStatus; description: string }[] = [
  { status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' },
  { status: HttpStatus.NOT_IMPLEMENTED, description: 'Not implemented' },
  { status: HttpStatus.BAD_GATEWAY, description: 'Bad gateway' },
  { status: HttpStatus.SERVICE_UNAVAILABLE, description: 'Service unavailable' },
  { status: HttpStatus.GATEWAY_TIMEOUT, description: 'Gateway timeout' },
  { status: HttpStatus.HTTP_VERSION_NOT_SUPPORTED, description: 'HTTP version not supported' },
  { status: HttpStatus.INSUFFICIENT_STORAGE, description: 'Insufficient storage' },
  { status: HttpStatus.LOOP_DETECTED, description: 'Loop detected' },
  { status: HttpStatus.METHOD_NOT_ALLOWED, description: 'Method not allowed' },
  { status: HttpStatus.REQUEST_TIMEOUT, description: 'Request timeout' },
  { status: HttpStatus.TOO_MANY_REQUESTS, description: 'Too many requests' },
]

/** Where a document says its surface is served. */
export type SwaggerServers = { local: string; deployed: string }

/** The OpenAPI document header of one surface: identity, servers, errors and auth schemes (#458). */
export function buildSwaggerConfig(
  surface: ApiSurface,
  servers: SwaggerServers,
): Omit<OpenAPIObject, 'paths'> {
  const builder = new DocumentBuilder()
    .setTitle(SURFACE_DOC_TITLES[surface])
    .setDescription(SURFACE_DOC_DESCRIPTIONS[surface])
    .setVersion(API_DOC_VERSION)
    .addServer(servers.local, 'Local server')
    .addServer(servers.deployed, 'Deployed server')
    .setContact('Lordpluha', 'https://github.com/Lordpluha', 'vladyslav.tesliuk.official@gmail.com')

  if (surface === 'public') {
    builder.addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: '/api/v1/auth/oauth/google',
          tokenUrl: '/api/v1/auth/oauth/google/callback',
          scopes: {},
        },
      },
    })
  }

  for (const response of GLOBAL_RESPONSES) builder.addGlobalResponse(response)

  // One scheme per session cookie, named after it, as each audience's guard references its own.
  // The third argument is the scheme name; without it every cookie overwrote one `cookie` scheme.
  for (const audience of SURFACE_AUDIENCES[surface]) {
    for (const [kind, name] of Object.entries(SESSION_COOKIE_NAMES[audience])) {
      builder.addCookieAuth(
        name,
        {
          type: 'apiKey',
          in: 'cookie',
          name,
          description: `HttpOnly ${kind} token cookie of a ${audience} session`,
        },
        name,
      )
    }
  }

  return builder.build()
}
