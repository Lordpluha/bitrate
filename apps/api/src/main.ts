import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser)
  const config = new DocumentBuilder()
    .setTitle('@spotify/api')
    .setDescription('@spotify/api Swagger documentation')
    .setVersion(process.env.npm_package_version ?? '1.0')
    .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Local server')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json'
  })
  app.enableCors({
    origin: process.env.WEB_HOST ?? '*',
    allowedHeaders: ['Content-Type']
  })
  await app.listen(process.env.PORT ?? 3000)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
