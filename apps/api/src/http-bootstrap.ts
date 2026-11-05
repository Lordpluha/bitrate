import type { ApiSurface, AppConfig } from '@common/config'
import { resolveTrustProxySetting } from '@common/config/trusted-proxy.config'
import { STATIC_ASSETS_GLOBAL_PREFIX_OPTIONS } from '@infra/storage/static-assets.routing'
import { type Type, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { Logger as PinoLogger } from 'nestjs-pino'
import { buildSwaggerConfig, type SwaggerServers } from './swagger-config'

/** Production origins listed in Swagger when the environment names none. */
const DEFAULT_DEPLOYED_URLS: Record<ApiSurface, string> = {
  public: 'https://api.bitrate.me',
  admin: 'https://admin.bitrate.me',
}

/** The port a surface listens on, the origins its responses may be fetched from, and its servers. */
function surfaceSettings(surface: ApiSurface, config: ConfigService<AppConfig>) {
  const { userHost, artistHost, adminHost } = config.getOrThrow('web')

  if (surface === 'admin') {
    const port = config.getOrThrow('ADMIN_API_PORT')
    return {
      port,
      connectSrc: adminHost ? [adminHost] : [],
      servers: {
        local: `http://localhost:${port}`,
        deployed: adminHost ?? DEFAULT_DEPLOYED_URLS.admin,
      } satisfies SwaggerServers,
    }
  }

  const port = config.getOrThrow('PORT')
  return {
    port,
    connectSrc: [userHost, artistHost],
    servers: {
      local: `http://localhost:${port}`,
      // The deployed origin comes from `API_BASE_URL`, so it is listed once whichever is set.
      deployed: config.get('API_BASE_URL') ?? DEFAULT_DEPLOYED_URLS.public,
    } satisfies SwaggerServers,
  }
}

/**
 * Creates, configures and starts one HTTP process of the API (#458): `main.ts` serves the public
 * surface from `AppModule`, `main.admin.ts` the operator surface from `AdminAppModule`. Both share
 * the security headers, prefix, versioning and Swagger setup; each gets its own port, CORS
 * origins and OpenAPI document.
 */
export async function bootstrapHttp(rootModule: Type, surface: ApiSurface): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(rootModule, { bufferLogs: true })
  app.useLogger(app.get(PinoLogger))
  const configService = app.get<ConfigService<AppConfig>>(ConfigService)
  const settings = surfaceSettings(surface, configService)
  app.set('trust proxy', resolveTrustProxySetting(configService.getOrThrow('TRUST_PROXY_HOPS')))

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", ...settings.connectSrc],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  )
  app.use(cookieParser())
  // HttpExceptionFilter is registered as an APP_FILTER provider in AppCoreModule — it needs
  // I18nService injected, which `new HttpExceptionFilter()` here could not supply.

  // Add global prefix /api to all routes except the public image route (`/static/*`, served from
  // object storage at the URL clients already use) and swagger
  app.setGlobalPrefix('api', STATIC_ASSETS_GLOBAL_PREFIX_OPTIONS)

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  app.enableCors(configService.getOrThrow('connections').http[surface])
  app.enableShutdownHooks()

  const config = buildSwaggerConfig(surface, settings.servers)
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
    customSiteTitle: config.info.title,
    swaggerOptions: {
      filter: true,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
    },
  })

  await app.listen(settings.port)
}
