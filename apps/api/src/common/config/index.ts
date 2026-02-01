import { type ConfigType } from '@nestjs/config'
import type { envType } from '../../../env.schema'
import { cookieConfig } from './cookie.config'
import { corsConfigFactory } from './cors.config'
import { storageConfigFactory } from './storage.config'

export const appConfigs = [cookieConfig, storageConfigFactory, corsConfigFactory]

export type AppConfig = envType & {
  cookie: ConfigType<typeof cookieConfig>
  cors: ConfigType<typeof corsConfigFactory>
  storage: ConfigType<typeof storageConfigFactory>
}
