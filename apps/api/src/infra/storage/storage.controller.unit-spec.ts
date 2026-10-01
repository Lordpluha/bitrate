import { describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import { createSignedStorageToken } from './signed-storage-token'
import { StorageController } from './storage.controller'
import type { StorageService } from './storage.types'

const SECRET = 'controller-test-secret'

function buildResponse() {
  const res = { status: jest.fn(), set: jest.fn() }
  res.status.mockReturnValue(res)
  return res
}

function buildController(storage: Partial<StorageService>) {
  const config = { getOrThrow: () => SECRET } as unknown as ConfigService<never>
  return new StorageController(config, storage as StorageService)
}

describe('StorageController.streamSignedObject', () => {
  it('reads the object through STORAGE_SERVICE and preserves Range and caching headers', async () => {
    const pipe = jest.fn()
    const getObjectStream = jest.fn().mockResolvedValue({
      stream: { pipe },
      contentLength: 4,
      contentType: 'audio/mp4',
      contentRange: 'bytes 2-5/10',
    } as never)
    const controller = buildController({
      getObjectStream: getObjectStream as StorageService['getObjectStream'],
    })
    const res = buildResponse()
    const token = createSignedStorageToken('tracks/t/cmaf/128.m4a', 60, SECRET)

    await controller.streamSignedObject(
      token,
      { headers: { range: 'bytes=2-5' } } as Request,
      res as unknown as Response,
    )

    expect(getObjectStream).toHaveBeenCalledWith('tracks/t/cmaf/128.m4a', 'bytes=2-5')
    expect(pipe).toHaveBeenCalledWith(res)
    expect(res.status).toHaveBeenCalledWith(206)
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'audio/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Length': 4,
        'Content-Range': 'bytes 2-5/10',
        'Cache-Control': 'private, max-age=3600, no-transform',
      }),
    )
  })

  it('rejects an invalid token and a missing object', async () => {
    const controller = buildController({
      getObjectStream: jest
        .fn()
        .mockRejectedValue(new Error('NoSuchKey') as never) as StorageService['getObjectStream'],
    })
    const res = buildResponse() as unknown as Response
    const req = { headers: {} } as Request

    await expect(controller.streamSignedObject('bad.token', req, res)).rejects.toThrow(
      NotFoundException,
    )
    const token = createSignedStorageToken('missing', 60, SECRET)
    await expect(controller.streamSignedObject(token, req, res)).rejects.toThrow(NotFoundException)
  })
})
