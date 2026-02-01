import { HttpStatus, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import type { AppConfig } from './common/config'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService<AppConfig>>(ConfigService)

  app.use(cookieParser())
  app.useGlobalFilters(new HttpExceptionFilter())

  // Add global prefix /api to all routes except static files and swagger
  app.setGlobalPrefix('api')

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  app.enableCors(configService.getOrThrow('cors').http)

  const config = new DocumentBuilder()
    .setTitle(process.env.npm_package_name || 'API Documentation')
    .setDescription(`${process.env.npm_package_name} Swagger documentation`)
    .setVersion(process.env.npm_package_version ?? '1.0')
    .addServer(`http://localhost:${configService.getOrThrow('PORT')}`, 'Local server')
    .addServer('https://spotify-clone-api-jp5z.onrender.com/', 'Remote dev server')
    // In progress
    .addOAuth2({
      type: 'openIdConnect',
    })
    .addCookieAuth(configService.getOrThrow('ACCESS_TOKEN_NAME'), {
      type: 'apiKey',
      in: 'cookie',
      name: configService.getOrThrow('ACCESS_TOKEN_NAME'),
      description: `HttpOnly cookies: ${configService.getOrThrow('ACCESS_TOKEN_NAME')} and ${configService.getOrThrow('REFRESH_TOKEN_NAME')}`,
    })
    .setContact('Lordpluha', 'https://github.com/Lordpluha', 'vladislavteslyukofficial@gmail.com')
    // Global server errors
    .addGlobalResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
    })
    .addGlobalResponse({
      status: HttpStatus.NOT_IMPLEMENTED,
      description: 'Not implemented',
    })
    .addGlobalResponse({
      status: HttpStatus.BAD_GATEWAY,
      description: 'Bad gateway',
    })
    .addGlobalResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'Service unavailable',
    })
    .addGlobalResponse({
      status: HttpStatus.GATEWAY_TIMEOUT,
      description: 'Gateway timeout',
    })
    .addGlobalResponse({
      status: HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
      description: 'HTTP version not supported',
    })
    .addGlobalResponse({
      status: HttpStatus.INSUFFICIENT_STORAGE,
      description: 'Insufficient storage',
    })
    .addGlobalResponse({
      status: HttpStatus.LOOP_DETECTED,
      description: 'Loop detected',
    })

    // Global method errors
    .addGlobalResponse({
      status: HttpStatus.METHOD_NOT_ALLOWED,
      description: 'Method not allowed',
    })
    .addGlobalResponse({
      status: HttpStatus.REQUEST_TIMEOUT,
      description: 'Request timeout',
    })
    .addGlobalResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Too many requests',
    })
    .setExternalDoc('@spotify/docs', '')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  })

  await app.listen(configService.get<number>('PORT') ?? 3000)
}

bootstrap()
