import { HttpStatus, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { corsConfig } from './common/config/cors.config'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.useGlobalFilters(new HttpExceptionFilter())

  // Add global prefix /api to all routes except static files and swagger
  app.setGlobalPrefix('api')

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  app.enableCors(corsConfig)

  const config = new DocumentBuilder()
    .setTitle(process.env.npm_package_name || 'API Documentation')
    .setDescription(`${process.env.npm_package_name} Swagger documentation`)
    .setVersion(process.env.npm_package_version ?? '1.0')
    .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Local server')
    .addServer('https://spotify-clone-api-jp5z.onrender.com/', 'Remote dev server')
    // In progress
    .addOAuth2({
      type: 'openIdConnect',
    })
    .addCookieAuth(process.env.ACCESS_TOKEN_NAME, {
      type: 'apiKey',
      in: 'cookie',
      name: process.env.ACCESS_TOKEN_NAME,
      description: `HttpOnly cookies: ${process.env.ACCESS_TOKEN_NAME} and ${process.env.REFRESH_TOKEN_NAME}`,
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
    .setExternalDoc('Mintlify', 'https://lordpluha.mintlify.app/')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  })

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
