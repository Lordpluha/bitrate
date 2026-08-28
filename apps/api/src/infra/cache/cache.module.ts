import { Module } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from './cache.constants'
import { CacheService } from './cache.service'

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () =>
        new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT ?? 6379),
          lazyConnect: true,
        }),
    },
    CacheService,
  ],
  exports: [REDIS_CLIENT, CacheService],
})
export class CacheModule {}
