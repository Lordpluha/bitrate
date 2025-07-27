import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

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
