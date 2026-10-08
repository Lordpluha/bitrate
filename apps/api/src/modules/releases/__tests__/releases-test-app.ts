import { PrismaService } from '@infra/prisma/prisma.service'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  type ExecutionContext,
  type INestApplication,
  UnauthorizedException,
  VersioningType,
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import type { Prisma } from '@prisma/client'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import type { Request } from 'express'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { buildArtist } from '../../artists/__tests__/fixtures/artists.fixtures'
import { ReleasesModule } from '../releases.module'

export const ownerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
export const otherOwnerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d480'
export const creditId = '0199aee0-0000-7000-8000-0000000000c1'
export const trackDraftId = '0199aee0-0000-7000-8000-0000000000d1'
export const transactionMock = mockDeep<Prisma.TransactionClient>()

export const draft = {
  id: '0199aee0-0000-7000-8000-000000000001',
  ownerArtistId: ownerId,
  title: 'First release',
  cover: null,
  isDemo: false,
  type: 'SINGLE' as const,
  status: 'DRAFT' as const,
  upc: null,
  scheduledAt: null,
  masterOwnerType: null,
  masterOwnerName: null,
  writersConfirmedAt: null,
  accuracyConfirmedAt: null,
  submittedAt: null,
  deletedAt: null,
  createdAt: new Date('2026-10-02T10:00:00Z'),
  updatedAt: new Date('2026-10-02T10:00:00Z'),
}

/** Boots ReleasesModule with mocked Prisma; `x-test-artist` selects the signed-in artist. */
export async function createReleasesTestApp(): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [
      ReleasesModule,
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        ignoreEnvVars: true,
        skipProcessEnv: true,
        load: [
          () => ({
            JWT_SECRET: 'release-tests-only',
            JWT_ACCESS_EXPIRES_IN: '15m',
            JWT_REFRESH_EXPIRES_IN: '7d',
          }),
        ],
      }),
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .overrideGuard(ArtistAuthGuard)
    .useValue({
      canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request & ArtistAuthRequest>()
        const id = req.headers['x-test-artist']
        if (id !== ownerId && id !== otherOwnerId) throw new UnauthorizedException()
        req.artist = buildArtist({ id })
        return true
      },
    })
    .compile()
  const app = module.createNestApplication({ logger: false })
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
  await app.init()
  return app
}

/** Routes interactive transactions to `transactionMock`. */
export function resetReleaseMocks(): void {
  resetPrismaMock()
  mockReset(transactionMock)
  prismaMock.$transaction.mockImplementation(async (operation) => {
    if (typeof operation !== 'function') throw new Error('Expected an interactive transaction')
    return await operation(transactionMock)
  })
}
