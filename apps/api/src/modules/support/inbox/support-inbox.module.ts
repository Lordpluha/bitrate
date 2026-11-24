import { PrismaModule } from '@infra/prisma/prisma.module'
import { Module } from '@nestjs/common'
import { SupportInboxService } from './support-inbox.service'

/** Service-only, so the admin process can import it without the listener chat controllers. */
@Module({
  imports: [PrismaModule],
  providers: [SupportInboxService],
  exports: [SupportInboxService],
})
export class SupportInboxModule {}
