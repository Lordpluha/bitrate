import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  type ExecutionContext,
  type INestApplication,
  UnauthorizedException,
  VersioningType,
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Test } from '@nestjs/testing'
import type { Prisma } from '@prisma/client'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import type { Request } from 'express'
import { mockDeep, mockReset } from 'jest-mock-extended'
import request from 'supertest'
import { buildArtist } from '../artists/__tests__/fixtures/artists.fixtures'
import { ReleasesModule } from './releases.module'

const ownerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
const otherOwnerId = 'f47ac10b-58cc-4372-a567-0e02b2c3d480'
const transactionMock = mockDeep<Prisma.TransactionClient>()
const prismaPromise = <T>(value: T): Prisma.PrismaPromise<T> => {
  const promise = Promise.resolve(value)
  return {
    [Symbol.toStringTag]: 'PrismaPromise',
    // biome-ignore lint/suspicious/noThenProperty: Prisma delegates return intentional thenables.
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  }
}
const draft = {
  id: '0199aee0-0000-7000-8000-000000000001',
  ownerArtistId: ownerId,
  title: 'First release',
  cover: null,
  isDemo: false,
  type: 'SINGLE' as const,
  status: 'DRAFT' as const,
  upc: null,
  scheduledAt: null,
  deletedAt: null,
  createdAt: new Date('2026-10-02T10:00:00Z'),
  updatedAt: new Date('2026-10-02T10:00:00Z'),
}

describe('Release drafts (HTTP)', () => {
  let app: INestApplication

  beforeAll(async () => {
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
    app = module.createNestApplication({ logger: false })
    app.setGlobalPrefix('api')
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    await app.init()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetPrismaMock()
    mockReset(transactionMock)
    prismaMock.$transaction.mockImplementation(async (operation) => {
      if (typeof operation !== 'function') throw new Error('Expected an interactive transaction')
      return await operation(transactionMock)
    })
  })

  it('adds a credited participant to an owned draft and advances its version', async () => {
    const updated = { ...draft, updatedAt: new Date('2026-10-03T10:00:00Z') }
    const contributor = {
      id: otherOwnerId,
      releaseId: draft.id,
      artistId: null,
      displayName: 'Taylor Reid',
      roles: ['PERFORMER', 'COMPOSER'] as const,
    }
    transactionMock.release.updateManyAndReturn.mockResolvedValue([updated])
    transactionMock.releaseContributor.create.mockResolvedValue({
      ...contributor,
      roles: [...contributor.roles],
    })
    const response = await request(app.getHttpServer())
      .post(`/api/v1/releases/${draft.id}/contributors`)
      .set('x-test-artist', ownerId)
      .send({
        displayName: ' Taylor Reid ',
        roles: contributor.roles,
        expectedUpdatedAt: draft.updatedAt.toISOString(),
      })
      .expect(201)
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(response.body).toMatchObject({
      release: { id: draft.id, title: draft.title },
      participant: { id: otherOwnerId, displayName: 'Taylor Reid', roles: contributor.roles },
    })
    expect(response.body.participant).not.toHaveProperty('artistId')
    expect(response.body.participant).not.toHaveProperty('releaseId')
  })

  it('requires an artist session to add contributors', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/releases/${draft.id}/contributors`)
      .send({})
      .expect(401)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('edits an existing contributor without replacing its identity or artist link', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([
      { ...draft, updatedAt: new Date('2026-10-03T10:00:00Z') },
    ])
    transactionMock.releaseContributor.updateManyAndReturn.mockResolvedValue([
      {
        id: otherOwnerId,
        releaseId: draft.id,
        artistId: ownerId,
        displayName: 'Jordan Lee',
        roles: ['PRODUCER', 'COMPOSER'],
      },
    ])
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/contributors/${otherOwnerId}`)
      .set('x-test-artist', ownerId)
      .send({
        displayName: ' Jordan Lee ',
        roles: ['PRODUCER', 'COMPOSER'],
        expectedUpdatedAt: draft.updatedAt.toISOString(),
      })
      .expect(200)
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(response.body.participant).toEqual({
      id: otherOwnerId,
      displayName: 'Jordan Lee',
      roles: ['PRODUCER', 'COMPOSER'],
    })
    expect(transactionMock.releaseContributor.create).not.toHaveBeenCalled()
    expect(transactionMock.releaseContributor.updateManyAndReturn.mock.calls[0]?.[0]?.data).toEqual(
      { displayName: 'Jordan Lee', roles: ['PRODUCER', 'COMPOSER'] },
    )
  })

  it.each(['get', 'patch'] as const)(
    'requires an artist session to %s an existing contributor',
    async (method) => {
      await request(app.getHttpServer())
        [method](`/api/v1/releases/${draft.id}/contributors/${otherOwnerId}`)
        .expect(401)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.release.findFirst).not.toHaveBeenCalled()
    },
  )

  it('reads the latest contributor, including legacy credits needing roles', async () => {
    const record = {
      ...draft,
      contributors: [{ id: otherOwnerId, displayName: 'Jordan Lee', roles: [] }],
    }
    prismaMock.release.findFirst.mockResolvedValue(record)
    const response = await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}/contributors/${otherOwnerId}`)
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(response.body.participant).toEqual(record.contributors[0])
    expect(prismaMock.release.findFirst.mock.calls[0]?.[0]).toMatchObject({
      where: { id: draft.id, ownerArtistId: ownerId, deletedAt: null },
      select: {
        contributors: {
          where: { id: otherOwnerId },
          take: 1,
          select: { id: true, displayName: true, roles: true },
        },
      },
    })
  })

  it.each([false, true])(
    'hides unavailable contributor reads (release visible=%s)',
    async (visible) => {
      const record = { ...draft, contributors: [] }
      prismaMock.release.findFirst.mockResolvedValue(visible ? record : null)
      await request(app.getHttpServer())
        .get(`/api/v1/releases/${draft.id}/contributors/${otherOwnerId}`)
        .set('x-test-artist', ownerId)
        .expect(404)
    },
  )

  it.each([
    { roles: [] },
    { roles: ['MIXER'] },
    { roles: ['PRODUCER', 'PRODUCER'] },
    { displayName: ' ' },
    { displayName: 'x'.repeat(256) },
    { artistId: otherOwnerId },
    { releaseId: otherOwnerId },
    { shareBasisPoints: 5000 },
    { expectedUpdatedAt: 'yesterday' },
  ])('rejects invalid contributor edits %j', async (invalid) => {
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/contributors/${otherOwnerId}`)
      .set('x-test-artist', ownerId)
      .send({
        displayName: 'Jordan Lee',
        roles: ['PRODUCER'],
        expectedUpdatedAt: draft.updatedAt.toISOString(),
        ...invalid,
      })
      .expect(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it.each([false, true])(
    'rejects contributor edits after a release conflict (visible=%s)',
    async (visible) => {
      transactionMock.release.updateManyAndReturn.mockResolvedValue([])
      transactionMock.release.findFirst.mockResolvedValue(visible ? draft : null)
      await request(app.getHttpServer())
        .patch(`/api/v1/releases/${draft.id}/contributors/${otherOwnerId}`)
        .set('x-test-artist', ownerId)
        .send({
          displayName: 'Jordan Lee',
          roles: ['PRODUCER'],
          expectedUpdatedAt: draft.updatedAt.toISOString(),
        })
        .expect(visible ? 409 : 404)
      expect(transactionMock.releaseContributor.updateManyAndReturn).not.toHaveBeenCalled()
    },
  )

  it('cannot edit a contributor belonging to a different release', async () => {
    transactionMock.release.updateManyAndReturn.mockResolvedValue([draft])
    transactionMock.releaseContributor.updateManyAndReturn.mockResolvedValue([])
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}/contributors/${otherOwnerId}`)
      .set('x-test-artist', ownerId)
      .send({
        displayName: 'Jordan Lee',
        roles: ['PRODUCER'],
        expectedUpdatedAt: draft.updatedAt.toISOString(),
      })
      .expect(404)
    expect(
      transactionMock.releaseContributor.updateManyAndReturn.mock.calls[0]?.[0]?.where,
    ).toEqual({ id: otherOwnerId, releaseId: draft.id })
  })

  it('documents contributor detail and edits without changing the existing addition schema', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().build())
    const path = document.paths['/api/v1/releases/{id}/contributors/{contributorId}']
    expect(path?.get?.responses['200']).toBeDefined()
    expect(path?.patch?.requestBody).toBeDefined()
    expect(document.components?.schemas?.UpdateReleaseContributorDto).toMatchObject({
      required: ['displayName', 'roles', 'expectedUpdatedAt'],
    })
    expect(document.components?.schemas?.ReleaseContributorEntity).toMatchObject({
      properties: {
        release: { $ref: expect.stringContaining('ReleaseEntity') },
        participant: { $ref: expect.stringContaining('WorkspaceParticipantEntity') },
      },
    })
  })

  it.each([
    { displayName: '   ' },
    { displayName: 'x'.repeat(256) },
    { roles: [] },
    { roles: ['MIXER'] },
    { roles: ['PRODUCER', 'PRODUCER'] },
    { roles: 'PRODUCER' },
    { artistId: otherOwnerId },
    { releaseId: otherOwnerId },
    { shareBasisPoints: 10000 },
    { expectedUpdatedAt: 'yesterday' },
  ])('rejects invalid contributor fields %j', async (invalid) => {
    await request(app.getHttpServer())
      .post(`/api/v1/releases/${draft.id}/contributors`)
      .set('x-test-artist', ownerId)
      .send({
        displayName: 'Producer',
        roles: ['PRODUCER'],
        expectedUpdatedAt: draft.updatedAt.toISOString(),
        ...invalid,
      })
      .expect(400)
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it.each([false, true])(
    'does not create a credit after a rejected release version (visible=%s)',
    async (visible) => {
      transactionMock.release.updateManyAndReturn.mockResolvedValue([])
      transactionMock.release.findFirst.mockResolvedValue(visible ? draft : null)
      await request(app.getHttpServer())
        .post(`/api/v1/releases/${draft.id}/contributors`)
        .set('x-test-artist', otherOwnerId)
        .send({
          displayName: 'Producer',
          roles: ['PRODUCER'],
          expectedUpdatedAt: draft.updatedAt.toISOString(),
        })
        .expect(visible ? 409 : 404)
      expect(transactionMock.releaseContributor.create).not.toHaveBeenCalled()
      expect(transactionMock.release.updateManyAndReturn.mock.calls[0]?.[0]?.where).toMatchObject({
        id: draft.id,
        ownerArtistId: otherOwnerId,
        deletedAt: null,
        status: 'DRAFT',
        updatedAt: draft.updatedAt,
      })
    },
  )

  it('documents contributor writes and their response in Swagger', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().build())
    expect(document.paths['/api/v1/releases/{id}/contributors']?.post?.requestBody).toBeDefined()
    const schema = document.components?.schemas?.AddReleaseContributorDto
    expect(schema).toMatchObject({ required: ['displayName', 'roles', 'expectedUpdatedAt'] })
    expect(document.components?.schemas?.ReleaseContributorAddedEntity).toMatchObject({
      properties: {
        release: { $ref: expect.stringContaining('ReleaseEntity') },
        participant: { $ref: expect.stringContaining('WorkspaceParticipantEntity') },
      },
    })
  })

  it('requires an artist session before reading a release workspace', async () => {
    await request(app.getHttpServer()).get(`/api/v1/releases/${draft.id}/workspace`).expect(401)
    expect(prismaMock.release.findFirst).not.toHaveBeenCalled()
  })

  it('reads workspace metadata, schedule and credited participants without exposing account or audio data', async () => {
    const workspace = {
      ...draft,
      scheduledAt: new Date('2026-11-01T12:00:00Z'),
      owner: { username: 'Owner' },
      trackDrafts: [
        {
          id: draft.id,
          title: 'Private recording',
          version: 'ORIGINAL',
          status: 'DRAFT',
          duration: 180,
          isDemo: false,
        },
      ],
      tracks: [
        { position: 1, track: { id: otherOwnerId, title: 'Linked recording', duration: 200 } },
      ],
      contributors: [{ id: ownerId, displayName: 'Producer', roles: ['PRODUCER'] }],
      _count: { trackDrafts: 1, tracks: 1, contributors: 1 },
    }
    prismaMock.release.findFirst.mockResolvedValue(workspace)
    const response = await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}/workspace`)
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.body).toMatchObject({
      artistName: 'Owner',
      scheduledAt: '2026-11-01T12:00:00.000Z',
      trackCount: 2,
      tracks: [{ id: otherOwnerId, title: 'Linked recording', position: 1 }],
      participants: [{ displayName: 'Producer', roles: ['PRODUCER'] }],
      participantCount: 1,
    })
    expect(response.headers['cache-control']).toBe('private, no-store')
    const args = prismaMock.release.findFirst.mock.calls[0]?.[0]
    expect(args).toMatchObject({
      where: { id: draft.id, ownerArtistId: ownerId, deletedAt: null },
      select: {
        owner: { select: { username: true } },
        trackDrafts: { where: { ownerArtistId: ownerId, deletedAt: null }, take: 50 },
        tracks: { where: { track: { deletedAt: null } }, take: 50, orderBy: { position: 'asc' } },
        contributors: { take: 50, select: { id: true, displayName: true, roles: true } },
      },
    })
    expect(JSON.stringify(args)).not.toMatch(/audioUrl|email|password|previewUrl/)
    expect(response.body).not.toHaveProperty('owner')
    expect(response.body).not.toHaveProperty('_count')
  })

  it('preserves total counts beyond bounded previews', async () => {
    const workspace = {
      ...draft,
      owner: { username: 'Owner' },
      trackDrafts: [],
      tracks: [],
      contributors: [],
      _count: { trackDrafts: 51, tracks: 2, contributors: 60 },
    }
    prismaMock.release.findFirst.mockResolvedValue(workspace)
    const response = await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}/workspace`)
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.body).toMatchObject({
      trackDrafts: [],
      tracks: [],
      participants: [],
      trackCount: 53,
      participantCount: 60,
    })
  })

  it('returns a genuine empty workspace for an owned release without recordings or credits', async () => {
    const workspace = {
      ...draft,
      owner: { username: 'Owner' },
      trackDrafts: [],
      tracks: [],
      contributors: [],
      _count: { trackDrafts: 0, tracks: 0, contributors: 0 },
    }
    prismaMock.release.findFirst.mockResolvedValue(workspace)
    const response = await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}/workspace`)
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.body).toMatchObject({
      trackDrafts: [],
      tracks: [],
      participants: [],
      trackCount: 0,
      participantCount: 0,
      scheduledAt: null,
    })
  })

  it('hides foreign or deleted workspaces', async () => {
    prismaMock.release.findFirst.mockResolvedValue(null)
    await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}/workspace`)
      .set('x-test-artist', otherOwnerId)
      .expect(404)
    expect(prismaMock.release.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: draft.id, ownerArtistId: otherOwnerId, deletedAt: null },
      }),
    )
  })

  it('rejects malformed workspace IDs before querying persistence', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/releases/not-a-uuid/workspace')
      .set('x-test-artist', ownerId)
      .expect(400)
    expect(prismaMock.release.findFirst).not.toHaveBeenCalled()
  })

  it('does not turn a workspace persistence failure into an empty result', async () => {
    prismaMock.release.findFirst.mockRejectedValue(new Error('Database unavailable'))
    await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}/workspace`)
      .set('x-test-artist', ownerId)
      .expect(500)
  })

  it('documents nested workspace metadata in the generated Swagger schema', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().build())
    const operation = document.paths['/api/v1/releases/{id}/workspace']?.get
    expect(operation?.responses['200']).toMatchObject({
      content: {
        'application/json': { schema: { $ref: '#/components/schemas/ReleaseWorkspaceEntity' } },
      },
    })
    expect(document.components?.schemas?.WorkspaceParticipantEntity).toMatchObject({
      properties: { roles: { type: 'array' } },
    })
  })

  it('requires an artist session for reading and editing a release', async () => {
    await request(app.getHttpServer()).get(`/api/v1/releases/${draft.id}`).expect(401)
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}`)
      .send({ title: 'Updated release', expectedUpdatedAt: draft.updatedAt.toISOString() })
      .expect(401)
    expect(prismaMock.release.updateManyAndReturn).not.toHaveBeenCalled()
  })

  it('requires an artist session before reading the private Music catalogue', async () => {
    await request(app.getHttpServer()).get('/api/v1/artist-music/tracks').expect(401)
    await request(app.getHttpServer()).get('/api/v1/artist-music/releases').expect(401)
    await request(app.getHttpServer()).get('/api/v1/artist-music/counts').expect(401)
  })

  it('reads only an owned active release and disables shared caching', async () => {
    prismaMock.release.findFirst.mockResolvedValue(draft)
    const response = await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}`)
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.body).toMatchObject({ id: draft.id, title: draft.title })
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(prismaMock.release.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: draft.id, ownerArtistId: ownerId, deletedAt: null } }),
    )
  })

  it('updates title and type with an atomic owner, lifecycle and version guard', async () => {
    prismaMock.release.updateManyAndReturn.mockResolvedValue([
      { ...draft, title: 'Updated', type: 'EP' },
    ])
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}`)
      .set('x-test-artist', ownerId)
      .send({ title: '  Updated  ', type: 'EP', expectedUpdatedAt: draft.updatedAt.toISOString() })
      .expect(200)
    expect(response.body).toMatchObject({ title: 'Updated', type: 'EP', status: 'DRAFT' })
    expect(response.headers['cache-control']).toBe('private, no-store')
    expect(prismaMock.release.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: draft.id,
          ownerArtistId: ownerId,
          deletedAt: null,
          status: 'DRAFT',
          updatedAt: draft.updatedAt,
        },
        data: { title: 'Updated', type: 'EP' },
      }),
    )
  })

  it.each(['2026-11-01T12:30:00.000+02:00', null])(
    'saves or clears only the planned schedule: %s',
    async (scheduledAt) => {
      const date = scheduledAt === null ? null : new Date(scheduledAt)
      prismaMock.release.updateManyAndReturn.mockResolvedValue([{ ...draft, scheduledAt: date }])
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/releases/${draft.id}`)
        .set('x-test-artist', ownerId)
        .send({ scheduledAt, expectedUpdatedAt: draft.updatedAt.toISOString() })
        .expect(200)
      expect(response.body.scheduledAt).toBe(date?.toISOString() ?? null)
      expect(prismaMock.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: draft.id,
            ownerArtistId: ownerId,
            deletedAt: null,
            status: 'DRAFT',
            updatedAt: draft.updatedAt,
          },
          data: { scheduledAt: date },
        }),
      )
    },
  )

  it.each([{ title: 'Updated' }, { type: 'EP' }])(
    'preserves fields omitted from a partial update: %j',
    async (fields) => {
      prismaMock.release.updateManyAndReturn.mockResolvedValue([draft])
      await request(app.getHttpServer())
        .patch(`/api/v1/releases/${draft.id}`)
        .set('x-test-artist', ownerId)
        .send({ ...fields, expectedUpdatedAt: draft.updatedAt.toISOString() })
        .expect(200)
      expect(prismaMock.release.updateManyAndReturn).toHaveBeenCalledWith(
        expect.objectContaining({ data: fields }),
      )
    },
  )

  it.each(['DRAFT', 'READY', 'SUBMITTED', 'RELEASED', 'REJECTED'] as const)(
    'reports a stale or non-draft %s release as a conflict without retrying',
    async (status) => {
      prismaMock.release.updateManyAndReturn.mockResolvedValue([])
      prismaMock.release.findFirst.mockResolvedValue({ ...draft, status })
      await request(app.getHttpServer())
        .patch(`/api/v1/releases/${draft.id}`)
        .set('x-test-artist', ownerId)
        .send({ title: 'Updated', expectedUpdatedAt: draft.updatedAt.toISOString() })
        .expect(409)
      expect(prismaMock.release.updateManyAndReturn).toHaveBeenCalledTimes(1)
    },
  )

  it('hides unavailable releases on reads and writes, including from another artist', async () => {
    prismaMock.release.findFirst.mockResolvedValue(null)
    prismaMock.release.updateManyAndReturn.mockResolvedValue([])
    await request(app.getHttpServer())
      .get(`/api/v1/releases/${draft.id}`)
      .set('x-test-artist', otherOwnerId)
      .expect(404)
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}`)
      .set('x-test-artist', otherOwnerId)
      .send({ title: 'Updated', expectedUpdatedAt: draft.updatedAt.toISOString() })
      .expect(404)
    expect(prismaMock.release.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownerArtistId: otherOwnerId, deletedAt: null }),
      }),
    )
  })

  it.each([
    {},
    { title: 'Updated', expectedUpdatedAt: undefined },
    { expectedUpdatedAt: draft.updatedAt.toISOString() },
    { title: ' ' },
    { title: 'x'.repeat(256) },
    { type: 'UNKNOWN' },
    { title: 'Updated', status: 'RELEASED' },
    { title: 'Updated', ownerArtistId: otherOwnerId },
    { title: 'Updated', unexpected: true },
    { title: 'Updated', expectedUpdatedAt: 'yesterday' },
    { scheduledAt: '2026-02-30T12:00:00.000Z' },
    { scheduledAt: '2026-11-01T12:00:00.000' },
    { scheduledAt: '2026-11-01' },
    { scheduledAt: '2026-11-01T12:00:00.000123Z' },
    { scheduledAt: '0000-11-01T12:00:00.000Z' },
    { scheduledAt: true },
    { scheduledAt: null, ownerArtistId: otherOwnerId },
    { scheduledAt: null, status: 'RELEASED' },
  ])('rejects unsafe or incomplete edits: %j', async (input) => {
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}`)
      .set('x-test-artist', ownerId)
      .send({ expectedUpdatedAt: draft.updatedAt.toISOString(), ...input })
      .expect(400)
    expect(prismaMock.release.updateManyAndReturn).not.toHaveBeenCalled()
  })

  it('rejects invalid identifiers before querying and propagates failed writes', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/releases/not-a-uuid')
      .set('x-test-artist', ownerId)
      .expect(400)
    await request(app.getHttpServer())
      .patch('/api/v1/releases/not-a-uuid')
      .set('x-test-artist', ownerId)
      .send({ title: 'Updated', expectedUpdatedAt: draft.updatedAt.toISOString() })
      .expect(400)
    expect(prismaMock.release.findFirst).not.toHaveBeenCalled()
    expect(prismaMock.release.updateManyAndReturn).not.toHaveBeenCalled()
    prismaMock.release.updateManyAndReturn.mockRejectedValue(new Error('Database unavailable'))
    await request(app.getHttpServer())
      .patch(`/api/v1/releases/${draft.id}`)
      .set('x-test-artist', ownerId)
      .send({ title: 'Updated', expectedUpdatedAt: draft.updatedAt.toISOString() })
      .expect(500)
  })

  it('documents the edit version and conflict response without exposing ownership or status input', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().build())
    expect(document.paths['/api/v1/releases/{id}']?.get?.responses).toHaveProperty('200')
    expect(document.paths['/api/v1/releases/{id}']?.patch?.responses).toHaveProperty('409')
    expect(document.components?.schemas?.UpdateReleaseDto).toMatchObject({
      required: ['expectedUpdatedAt'],
      properties: { title: { maxLength: 255 }, expectedUpdatedAt: { type: 'string' } },
    })
    expect(document.components?.schemas?.UpdateReleaseDto).not.toHaveProperty(
      'properties.ownerArtistId',
    )
    expect(document.components?.schemas?.UpdateReleaseDto).not.toHaveProperty('properties.status')
    expect(document.components?.schemas?.UpdateReleaseDto).toHaveProperty('properties.scheduledAt')
  })

  it('combines bounded Music filters with the authenticated owner and stable ordering', async () => {
    prismaMock.artistTrackDraft.findMany.mockResolvedValue([])
    prismaMock.artistTrackDraft.count.mockResolvedValue(0)
    await request(app.getHttpServer())
      .get(
        '/api/v1/artist-music/tracks?search=night&status=READY&type=ORIGINAL&sort=title&page=2&limit=6',
      )
      .set('x-test-artist', ownerId)
      .expect(200)
    const where = {
      ownerArtistId: ownerId,
      deletedAt: null,
      title: { contains: 'night', mode: 'insensitive' },
      status: 'READY',
      version: 'ORIGINAL',
    } satisfies Prisma.ArtistTrackDraftWhereInput
    expect(prismaMock.artistTrackDraft.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where,
        skip: 6,
        take: 6,
        orderBy: [{ title: 'asc' }, { id: 'asc' }],
      }),
    )
    expect(prismaMock.artistTrackDraft.count).toHaveBeenCalledWith({ where })
  })

  it('counts only the current artist’s active private recordings and releases', async () => {
    prismaMock.artistTrackDraft.count.mockResolvedValue(6)
    prismaMock.release.count.mockResolvedValue(3)
    const response = await request(app.getHttpServer())
      .get('/api/v1/artist-music/counts')
      .set('x-test-artist', otherOwnerId)
      .expect(200)
    expect(response.body).toEqual({ tracks: 6, releases: 3 })
    expect(response.headers['cache-control']).toBe('private, no-store')
    const where = { ownerArtistId: otherOwnerId, deletedAt: null }
    expect(prismaMock.artistTrackDraft.count).toHaveBeenCalledWith({ where })
    expect(prismaMock.release.count).toHaveBeenCalledWith({ where })
  })

  it('filters release catalogue summaries without changing the draft API', async () => {
    prismaMock.release.findMany.mockResolvedValue([])
    prismaMock.release.count.mockResolvedValue(0)
    await request(app.getHttpServer())
      .get('/api/v1/artist-music/releases?type=EP&status=DRAFT&sort=oldest')
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(prismaMock.release.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerArtistId: ownerId, deletedAt: null, type: 'EP', status: 'DRAFT' },
        orderBy: [{ updatedAt: 'asc' }, { id: 'desc' }],
      }),
    )
  })

  it.each([
    'status=UNKNOWN',
    'type=SINGLE',
    'ownerArtistId=other',
    'sort=password',
    'page=0',
    'limit=101',
    `search=${'x'.repeat(101)}`,
  ])('rejects invalid Music track filters: %s', async (query) => {
    await request(app.getHttpServer())
      .get(`/api/v1/artist-music/tracks?${query}`)
      .set('x-test-artist', ownerId)
      .expect(400)
    expect(prismaMock.artistTrackDraft.findMany).not.toHaveBeenCalled()
  })

  it('publishes usable draft input and paginated response schemas in Swagger', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().build())
    expect(document).toMatchObject({
      paths: {
        '/api/v1/releases': {
          post: {
            requestBody: {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/CreateReleaseDto' } },
              },
            },
          },
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      required: ['data', 'total', 'page', 'limit'],
                      properties: {
                        data: { items: { $ref: '#/components/schemas/ReleaseEntity' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          CreateReleaseDto: {
            required: ['title'],
            properties: {
              title: { type: 'string', minLength: 1, maxLength: 255 },
              type: {
                enum: expect.arrayContaining(['SINGLE', 'ALBUM', 'EP', 'COMPILATION']),
              },
            },
          },
        },
      },
    })
    expect(document.components?.schemas?.CreateReleaseDto).not.toHaveProperty(
      'properties.ownerArtistId',
    )
    expect(document.components?.schemas?.CreateReleaseDto).not.toHaveProperty('properties.status')
  })

  it('creates an owned DRAFT from a trimmed title without requiring release metadata', async () => {
    prismaMock.release.create.mockResolvedValue(draft)
    const response = await request(app.getHttpServer())
      .post('/api/v1/releases')
      .set('x-test-artist', ownerId)
      .send({ title: '  First release  ' })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({ title: draft.title, status: 'DRAFT', type: 'SINGLE' })
    expect(prismaMock.release.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { ownerArtistId: ownerId, title: draft.title, type: 'SINGLE', status: 'DRAFT' },
      }),
    )
    expect(response.headers['cache-control']).toBe('private, no-store')
  })

  it('requires an artist session for both creating and listing drafts', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/releases')
      .send({ title: draft.title })
      .expect(401)
    await request(app.getHttpServer()).get('/api/v1/releases').expect(401)
    expect(prismaMock.release.create).not.toHaveBeenCalled()
    expect(prismaMock.release.findMany).not.toHaveBeenCalled()
  })

  it.each([
    {},
    { title: '   ' },
    { title: 'x'.repeat(256) },
    { title: 123 },
    { title: draft.title, type: 'UNKNOWN' },
    { title: draft.title, ownerArtistId: otherOwnerId },
    { title: draft.title, status: 'RELEASED' },
  ])('rejects invalid or server-controlled fields: %j', async (body) => {
    await request(app.getHttpServer())
      .post('/api/v1/releases')
      .set('x-test-artist', ownerId)
      .send(body)
      .expect(400)
    expect(prismaMock.release.create).not.toHaveBeenCalled()
  })

  it('accepts an explicit album type', async () => {
    prismaMock.release.create.mockResolvedValue({ ...draft, type: 'EP' })
    await request(app.getHttpServer())
      .post('/api/v1/releases')
      .set('x-test-artist', ownerId)
      .send({ title: draft.title, type: 'EP' })
      .expect(201)
    expect(prismaMock.release.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'EP', ownerArtistId: ownerId, status: 'DRAFT' }),
      }),
    )
  })

  it('scopes both results and totals to the current owner and hides soft-deleted releases', async () => {
    const records = [
      draft,
      { ...draft, id: 'other-release', ownerArtistId: otherOwnerId },
      { ...draft, id: 'deleted-release', deletedAt: new Date() },
    ]
    prismaMock.release.findMany.mockImplementation((args) =>
      prismaPromise(
        records.filter(
          (item) =>
            item.ownerArtistId === args?.where?.ownerArtistId &&
            item.deletedAt === args?.where?.deletedAt,
        ),
      ),
    )
    prismaMock.release.count.mockImplementation((args) =>
      prismaPromise(
        records.filter(
          (item) =>
            item.ownerArtistId === args?.where?.ownerArtistId &&
            item.deletedAt === args?.where?.deletedAt,
        ).length,
      ),
    )

    const response = await request(app.getHttpServer())
      .get('/api/v1/releases')
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.body).toMatchObject({ data: [{ id: draft.id }], total: 1, page: 1, limit: 20 })
    expect(response.body.data).toHaveLength(1)
    expect(response.headers['cache-control']).toBe('private, no-store')

    const otherResponse = await request(app.getHttpServer())
      .get('/api/v1/releases')
      .set('x-test-artist', otherOwnerId)
      .expect(200)
    expect(otherResponse.body.data).toHaveLength(1)
    expect(otherResponse.body.data[0].id).toBe('other-release')
    expect(otherResponse.body.total).toBe(1)
  })

  it('returns an honest empty page when the artist has no releases', async () => {
    prismaMock.release.findMany.mockResolvedValue([])
    prismaMock.release.count.mockResolvedValue(0)
    const response = await request(app.getHttpServer())
      .get('/api/v1/releases')
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.body).toEqual({ data: [], total: 0, page: 1, limit: 20 })
  })

  it('uses bounded pagination with deterministic newest-first ordering', async () => {
    prismaMock.release.findMany.mockResolvedValue([])
    prismaMock.release.count.mockResolvedValue(0)
    const response = await request(app.getHttpServer())
      .get('/api/v1/releases?page=2&limit=5')
      .set('x-test-artist', ownerId)
      .expect(200)
    expect(response.body).toMatchObject({ page: 2, limit: 5 })
    expect(prismaMock.release.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    )
  })

  it.each(['page=0', 'page=1.5', 'page=oops', 'limit=0', 'limit=101', 'ownerArtistId=other'])(
    'rejects invalid or unsupported query fields: %s',
    async (query) => {
      await request(app.getHttpServer())
        .get(`/api/v1/releases?${query}`)
        .set('x-test-artist', ownerId)
        .expect(400)
      expect(prismaMock.release.findMany).not.toHaveBeenCalled()
      expect(prismaMock.release.count).not.toHaveBeenCalled()
    },
  )

  it('propagates persistence failures instead of reporting a saved draft', async () => {
    prismaMock.release.create.mockRejectedValue(new Error('Database unavailable'))
    await request(app.getHttpServer())
      .post('/api/v1/releases')
      .set('x-test-artist', ownerId)
      .send({ title: draft.title })
      .expect(500)
  })
})
