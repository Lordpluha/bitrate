import type { AppConfig } from '@common/config'
import { S3Service } from '@infra/s3/s3.service'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LocalStorageService } from './local-storage.service'
import { STORAGE_SERVICE } from './storage.constants'
import { StorageController } from './storage.controller'

/**
 * Binds STORAGE_SERVICE to the driver selected by STORAGE_DRIVER ('s3' | 'local').
 * Only the selected driver is constructed, so S3 credentials are never required
 * to boot when the local driver is active (the default).
 */
@Module({
  controllers: [StorageController],
  providers: [
    LocalStorageService,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService, LocalStorageService],
      useFactory: (config: ConfigService<AppConfig>, local: LocalStorageService) =>
        config.getOrThrow('STORAGE_DRIVER') === 's3' ? new S3Service(config) : local,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
