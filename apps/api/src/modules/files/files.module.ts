import { PrismaModule } from '@infra/prisma/prisma.module'
import { AuthModule } from '@modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

@Module({
  imports: [PrismaModule, AuthModule, JwtModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
