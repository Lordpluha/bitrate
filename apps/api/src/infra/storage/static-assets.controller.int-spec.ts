import { Readable } from 'node:stream'
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals'
import { type INestApplication, VersioningType } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { StaticAssetsController } from './static-assets.controller'
import { STATIC_ASSETS_GLOBAL_PREFIX_OPTIONS } from './static-assets.routing'
import { STORAGE_SERVICE } from './storage.constants'
import type { StorageService } from './storage.types'

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])

describe('StaticAssetsController with the production routing (int)', () => {
  let app: INestApplication
  const getObjectStream = jest.fn((key: string) => {
    if (key !== 'tracks/covers/a.png') return Promise.reject(new Error('NoSuchKey'))
    return Promise.resolve({
      stream: Readable.from([PNG]),
      contentLength: PNG.length,
      contentType: 'image/png',
    })
  })

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StaticAssetsController],
      providers: [
        { provide: STORAGE_SERVICE, useValue: { getObjectStream } as unknown as StorageService },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    // The same prefix, exclusion and versioning main.ts applies.
    app.setGlobalPrefix('api', STATIC_ASSETS_GLOBAL_PREFIX_OPTIONS)
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    await app.init()
  })

  afterAll(() => app.close())

  it('serves GET /static/<key> outside the /api prefix and the /v1 version segment', async () => {
    const res = await request(app.getHttpServer()).get('/static/tracks/covers/a.png').expect(200)

    expect(res.headers['content-type']).toBe('image/png')
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable')
    expect(res.body).toEqual(PNG)
  })

  it('does not also expose the route under /api or /api/v1', async () => {
    await request(app.getHttpServer()).get('/api/static/tracks/covers/a.png').expect(404)
    await request(app.getHttpServer()).get('/api/v1/static/tracks/covers/a.png').expect(404)
  })

  it('answers 404 for an unknown key and never asks storage for a non-public key', async () => {
    await request(app.getHttpServer()).get('/static/tracks/covers/missing.png').expect(404)
    getObjectStream.mockClear()
    await request(app.getHttpServer())
      .get('/static/tracks/t1/generations/g/audio/master.opus')
      .expect(404)
    expect(getObjectStream).not.toHaveBeenCalled()
  })
})
