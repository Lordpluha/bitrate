import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import {
  createReleasesTestApp,
  draft,
  ownerId,
  resetReleaseMocks,
  transactionMock,
} from './__tests__/releases-test-app'

const version = draft.updatedAt.toISOString()
const plan = {
  destinations: ['SPOTIFY'],
  territories: { mode: 'WORLDWIDE' },
  expectedUpdatedAt: version,
}

describe('Release delivery plan (HTTP)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createReleasesTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
  })

  it('accepts a plan for a draft or an approved release, not one under review', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([])
    transactionMock.release.findFirst.mockResolvedValue({ id: draft.id } as never)
    await request(app.getHttpServer())
      .put(`/api/v1/releases/${draft.id}/delivery-plan`)
      .set('x-test-artist', ownerId)
      .send(plan)
      .expect(409)
    expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.where).toEqual({
      id: draft.id,
      ownerArtistId: ownerId,
      deletedAt: null,
      status: { in: ['DRAFT', 'READY'] },
      updatedAt: draft.updatedAt,
    })
    expect(transactionMock.releaseDestination.deleteMany).not.toHaveBeenCalled()
  })
})
