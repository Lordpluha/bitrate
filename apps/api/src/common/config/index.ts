import type { ConfigType } from '@nestjs/config'
import type { envType } from '../../../env.schema'
import { connectionsConfig } from './connections'
import { cookieConfig } from './cookie.config'
import { mailConfig } from './mail.config'
import { storageConfigFactory } from './storage.config'

export const appConfigs = [cookieConfig, storageConfigFactory, connectionsConfig, mailConfig]

export type AppConfig = envType & {
  [cookieConfig.KEY]: ConfigType<typeof cookieConfig>
  [connectionsConfig.KEY]: ConfigType<typeof connectionsConfig>
  [storageConfigFactory.KEY]: ConfigType<typeof storageConfigFactory>
  [mailConfig.KEY]: ConfigType<typeof mailConfig>
}
