import { createSignedStorageToken } from '@infra/storage/signed-storage-token'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { closeE2eApp, createE2eApp } from './e2e-app'

describe('Signed storage streaming (e2e)', () => {
  let app: INestApplication
  let storage: StorageService

  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
    storage = app.get<StorageService>(STORAGE_SERVICE)
  })

  afterAll(async () => closeE2eApp(app))

  it('validates a signed token and honors a byte range', async () => {
    const key = 'tracks/e2e/audio/128k.opus'
    const body = Buffer.from('0123456789')
    await storage.upload(key, body, 'audio/ogg')
    const token = createSignedStorageToken(key, 60, process.env.JWT_SECRET!)

    const response = await request(app.getHttpServer())
      .get(`/storage/objects/${encodeURIComponent(token)}`)
      .set('Range', 'bytes=2-5')
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => callback(null, Buffer.concat(chunks)))
      })
      .expect(206)

    expect(response.headers['content-range']).toBe('bytes 2-5/10')
    expect(response.headers['accept-ranges']).toBe('bytes')
    expect(response.body).toEqual(Buffer.from('2345'))
    await storage.deleteObject(key)
  })

  it('rejects an expired signed token', async () => {
    const token = createSignedStorageToken('tracks/e2e/missing.opus', -1, process.env.JWT_SECRET!)
    await request(app.getHttpServer())
      .get(`/storage/objects/${encodeURIComponent(token)}`)
      .expect(404)
  })
})
