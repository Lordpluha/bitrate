import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from '../prisma/prisma.module'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'

@Module({
  imports: [PrismaModule, AuthModule, JwtModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
