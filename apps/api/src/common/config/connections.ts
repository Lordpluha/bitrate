import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { registerAs } from '@nestjs/config'
import { GatewayMetadata } from '@nestjs/websockets'

/**
 * Allowed origins for CORS
 */
const getAllowedOrigins = (): CorsOptions['origin'] => {
  const baseOrigins = [
    /^http:\/\/localhost(:\d+)?$/, // Any localhost with optional port
    'file://', // For local HTML files
  ]

  const webHost = process.env.WEB_HOST || 'http://localhost:3001'

  return [webHost, ...baseOrigins, /^file:\/\//]
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
  ],
  exposedHeaders: [
    'Set-Cookie',
    'Content-Range',
    'Accept-Ranges',
    'Content-Length',
    'X-Track-Duration',
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

export const connectionsConfig = registerAs('connections', () => ({
  http: httpConfig,
  ws: websocketConfig,
}))
