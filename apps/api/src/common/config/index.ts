import type { ConfigType } from '@nestjs/config'
import type { envType } from '../../../env.schema'
import { connectionsConfig } from './connections'
import { cookieConfig } from './cookie.config'
import { mailConfig } from './mail.config'
import { s3Config } from './s3.config'
import { storageConfigFactory } from './storage.config'

/** The app configs value. */
export const appConfigs = [cookieConfig, storageConfigFactory, connectionsConfig, mailConfig, s3Config]

/** Defines the app config. */
export type AppConfig = envType & {
  [cookieConfig.KEY]: ConfigType<typeof cookieConfig>
  [connectionsConfig.KEY]: ConfigType<typeof connectionsConfig>
  [storageConfigFactory.KEY]: ConfigType<typeof storageConfigFactory>
  [mailConfig.KEY]: ConfigType<typeof mailConfig>
  [s3Config.KEY]: ConfigType<typeof s3Config>
}
