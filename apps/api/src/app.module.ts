import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { envSchema, envType } from '../env.schema'
import { PrismaModule } from './prisma/prisma.module'
import { TracksModule } from './tracks/tracks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env.production'],

      validate: (env: Record<string, unknown>): envType => envSchema.parse(env)
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TracksModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
