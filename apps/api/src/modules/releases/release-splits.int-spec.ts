import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import { prismaMock } from '@test/mocks'
import request from 'supertest'
import {
  createReleasesTestApp,
  creditId,
  draft,
  otherOwnerId,
  ownerId,
  resetReleaseMocks,
  transactionMock,
} from './__tests__/releases-test-app'

const version = draft.updatedAt.toISOString()
const advanced = { ...draft, updatedAt: new Date('2026-10-05T10:00:00Z') }
const secondCreditId = '0199aee0-0000-7000-8000-0000000000c2'
const url = `/api/v1/releases/${draft.id}/splits`

const put = (body: object, artist = ownerId) =>
  request(app.getHttpServer()).put(url).set('x-test-artist', artist).send(body)
let app: INestApplication

describe('Release splits (HTTP)', () => {
  beforeAll(async () => {
    app = await createReleasesTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetReleaseMocks()
    transactionMock.release.updateManyAndReturn.mockResolvedValue([advanced])
    transactionMock.releaseContributor.count.mockResolvedValue(2)
  })

  it('replaces one right type and clears the accuracy confirmation', async () => {
    const shares = [
      { contributorId: creditId, shareBasisPoints: 6_000 },
      { contributorId: secondCreditId, shareBasisPoints: 3_000 },
    ]
    const response = await put({
      rightType: 'COMPOSITION',
      shares,
      expectedUpdatedAt: version,
    }).expect(200)
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(response.body).toEqual({
      release: expect.objectContaining({ id: draft.id }),
      rightType: 'COMPOSITION',
      shares,
    })
    expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data).toMatchObject({
      accuracyConfirmedAt: null,
    })
    expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.data).not.toHaveProperty(
      'writersConfirmedAt',
    )
    expect(transactionMock.releaseContributor.count).toHaveBeenCalledWith({
      where: { releaseId: draft.id, id: { in: [creditId, secondCreditId] } },
    })
    expect(transactionMock.releaseSplit.deleteMany).toHaveBeenCalledWith({
      where: { releaseId: draft.id, rightType: 'COMPOSITION' },
    })
    expect(transactionMock.releaseSplit.createMany).toHaveBeenCalledWith({
      data: shares.map((share) => ({ ...share, releaseId: draft.id, rightType: 'COMPOSITION' })),
    })
  })

  it('clears a right type with an empty list', async () => {
    await put({ rightType: 'RECORDING', shares: [], expectedUpdatedAt: version }).expect(200)
    expect(transactionMock.releaseSplit.deleteMany).toHaveBeenCalled()
    expect(transactionMock.releaseSplit.createMany).not.toHaveBeenCalled()
  })

  it.each([
    ['more than 100% in total', [6_000, 4_001]],
    ['a zero share', [0]],
    ['a share above 100%', [10_001]],
    ['a fractional basis point', [50.5]],
  ])('rejects %s', async (_case, points) => {
    const shares = points.map((shareBasisPoints, index) => ({
      contributorId: index === 0 ? creditId : secondCreditId,
      shareBasisPoints,
    }))
    await put({ rightType: 'RECORDING', shares, expectedUpdatedAt: version }).expect(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('rejects listing a contributor twice', async () => {
    const share = { contributorId: creditId, shareBasisPoints: 1_000 }
    await put({
      rightType: 'RECORDING',
      shares: [share, share],
      expectedUpdatedAt: version,
    }).expect(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('rejects a contributor credited on another release and writes nothing', async () => {
    transactionMock.releaseContributor.count.mockResolvedValue(1)
    await put({
      rightType: 'RECORDING',
      shares: [
        { contributorId: creditId, shareBasisPoints: 5_000 },
        { contributorId: secondCreditId, shareBasisPoints: 5_000 },
      ],
      expectedUpdatedAt: version,
    }).expect(400)
    expect(transactionMock.releaseSplit.deleteMany).not.toHaveBeenCalled()
    expect(transactionMock.releaseSplit.createMany).not.toHaveBeenCalled()
  })

  it('hides a release owned by another artist', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([])
    transactionMock.release.findFirst.mockResolvedValue(null)
    await put(
      { rightType: 'RECORDING', shares: [], expectedUpdatedAt: version },
      otherOwnerId,
    ).expect(404)
    expect(transactionMock.releaseSplit.deleteMany).not.toHaveBeenCalled()
  })

  it('rejects a stale version', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([])
    transactionMock.release.findFirst.mockResolvedValue(draft)
    await put({ rightType: 'RECORDING', shares: [], expectedUpdatedAt: version }).expect(409)
  })

  it('requires an artist session', async () => {
    await request(app.getHttpServer()).put(url).send({}).expect(401)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })
})
