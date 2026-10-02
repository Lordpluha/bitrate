import type { SharedBullAsyncConfiguration } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'

/** `BullModule.forRootAsync()` options shared by the API and the standalone transcode worker. */
export const bullRootAsyncOptions: SharedBullAsyncConfiguration = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: {
      host: config.getOrThrow('REDIS_HOST'),
      port: config.getOrThrow('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
    },
  }),
}
