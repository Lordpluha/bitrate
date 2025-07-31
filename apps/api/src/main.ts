import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { HttpStatus } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  const config = new DocumentBuilder()
    .setTitle('@spotify/api')
    .setDescription('@spotify/api Swagger documentation')
    .setVersion(process.env.npm_package_version ?? '1.0')
    .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Local server')
    .addServer(
      'https://spotify-clone-api-jp5z.onrender.com/',
      'Remote dev server'
    )
    .addOAuth2({
      type: 'openIdConnect'
    })
    .setContact(
      'Lordpluha',
      'https://github.com/Lordpluha',
      'vladislavteslyukofficial@gmail.com'
    )
    // Global server errors
    .addGlobalResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error'
    })
    .addGlobalResponse({
      status: HttpStatus.NOT_IMPLEMENTED,
      description: 'Not implemented'
    })
    .addGlobalResponse({
      status: HttpStatus.BAD_GATEWAY,
      description: 'Bad gateway'
    })
    .addGlobalResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'Service unavailable'
    })
    .addGlobalResponse({
      status: HttpStatus.GATEWAY_TIMEOUT,
      description: 'Gateway timeout'
    })
    .addGlobalResponse({
      status: HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
      description: 'HTTP version not supported'
    })
    .addGlobalResponse({
      status: HttpStatus.INSUFFICIENT_STORAGE,
      description: 'Insufficient storage'
    })
    .addGlobalResponse({
      status: HttpStatus.LOOP_DETECTED,
      description: 'Loop detected'
    })

    // Global method errors
    .addGlobalResponse({
      status: HttpStatus.METHOD_NOT_ALLOWED,
      description: 'Method not allowed'
    })
    .addGlobalResponse({
      status: HttpStatus.REQUEST_TIMEOUT,
      description: 'Request timeout'
    })
    .addGlobalResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Too many requests'
    })
    .setExternalDoc('Mintlify', 'https://lordpluha.mintlify.app/')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json'
  })
  app.enableCors({
    origin: '*',
    allowedHeaders: ['Content-Type']
  })
  await app.listen(process.env.PORT ?? 3000)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
