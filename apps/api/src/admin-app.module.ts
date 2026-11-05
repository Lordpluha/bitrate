import { AdminModule } from '@modules/admin'
import { Module } from '@nestjs/common'
import { AppCoreModule } from './app-core.module'

/**
 * Root of the operator process (`main.admin.ts`, #458): the shared root wiring plus the operator
 * surface. It must not reach a listener/artist controller or a queue consumer, so admin modules
 * import service-only core modules (`TracksCoreModule`, `ReleasePublishingCoreModule`, ...).
 */
@Module({ imports: [AppCoreModule, AdminModule] })
export class AdminAppModule {}
