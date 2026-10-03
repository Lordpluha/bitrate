import { appConfigModuleOptions } from '@common/config/config-module.options'
import { loggerOptions } from '@infra/observability/logger.config'
import { PrismaModule } from '@infra/prisma/prisma.module'
import { bullRootAsyncOptions } from '@infra/queues/bull-root.options'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { TranscodeModule } from '@modules/tracks/transcode.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { WorkerHttpService } from './worker-http.service'

/**
 * Root module of the standalone transcode worker (ADR-0049): configuration, logging, the Redis
 * connection, the database and object storage, plus the conversion pipeline. No auth, cache,
 * throttler, i18n, Swagger or static serving.
 */
@Module({
  imports: [
    LoggerModule.forRoot(loggerOptions),
    ConfigModule.forRoot(appConfigModuleOptions),
    BullModule.forRootAsync(bullRootAsyncOptions),
    PrismaModule,
    StorageCoreModule,
    TranscodeModule,
  ],
  providers: [WorkerHttpService],
})
export class WorkerModule {}
