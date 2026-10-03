import type { AppConfig } from '@common/config'
import { S3Service } from '@infra/s3/s3.service'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { STORAGE_SERVICE } from './storage.constants'

/**
 * Binds STORAGE_SERVICE to the S3-compatible object store (SeaweedFS, ADR-0050). There is no
 * other backend: the S3 variables are required to boot.
 *
 * Deliberately has no auth imports so a process without HTTP (the transcode worker)
 * can use storage without pulling in the user/token modules. See ADR-0049.
 */
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => new S3Service(config),
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageCoreModule {}
