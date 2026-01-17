import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

/**
 * Allowed origins for CORS
 */
export const getAllowedOrigins = (): (string | RegExp)[] => [
  process.env.WEB_HOST || 'http://localhost:3001', // Web app
  'http://localhost:3000', // API docs
  'http://localhost:5555', // Prisma Studio
  'http://localhost:8080', // Test client server
  'http://localhost:8081', // Alternative test client server
  'http://0.0.0.0:8080',
  'file://', // For local HTML files
  /^file:\/\//, // Regex for file protocol
]

/**
 * Common CORS configuration for HTTP requests
 */
export const corsConfig: CorsOptions = {
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
 * CORS configuration for WebSocket connections
 */
export const websocketCorsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins()

    // Allow undefined origin (for local files) or file:// protocol
    if (!origin || origin.startsWith('file://')) {
      callback(null, true)
      return
    }

    // Check if origin matches any allowed origin (including regex)
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === 'string') {
        return allowed === origin
      }
      // RegExp
      return allowed.test(origin)
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}
