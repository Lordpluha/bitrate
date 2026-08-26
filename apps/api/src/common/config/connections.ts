import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { registerAs } from '@nestjs/config'
import type { GatewayMetadata } from '@nestjs/websockets'
import { resolveWebHosts } from './web.config'

/**
 * Allowed origins for CORS
 */
const getAllowedOrigins = (): CorsOptions['origin'] => {
  const baseOrigins = [
    /^http:\/\/localhost(:\d+)?$/, // Any localhost with optional port
  ]

  const { userHost, artistHost } = resolveWebHosts()

  return [...new Set([userHost, artistHost]), ...baseOrigins]
}

/**
 * Common CORS configuration for HTTP requests
 */
const httpConfig: CorsOptions = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Range',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'Set-Cookie',
    'Content-Range',
    'Accept-Ranges',
    'Content-Length',
    'X-Track-Duration',
    'X-Request-ID',
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
}

/**
 * Common configuration for WebSocket connections
 */
export const websocketConfig: GatewayMetadata = {
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
}

/** The connections config value. */
export const connectionsConfig = registerAs('connections', () => ({
  http: httpConfig,
  ws: websocketConfig,
}))
