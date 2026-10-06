import { describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { StaticAssetsController } from './static-assets.controller'
import type { StorageService } from './storage.types'

function buildResponse() {
  const res = { status: jest.fn(), set: jest.fn(), on: jest.fn() }
  res.status.mockReturnValue(res)
  return res
}

function buildController(storage: Partial<StorageService>) {
  return new StaticAssetsController(storage as StorageService)
}

const request = (path: string[] | string, range?: string) =>
  ({ params: { path }, headers: range ? { range } : {} }) as unknown as Request

describe('StaticAssetsController.serve', () => {
  it('streams a public image through STORAGE_SERVICE with long-lived caching', async () => {
    const pipe = jest.fn()
    const getObjectStream = jest.fn().mockResolvedValue({
      stream: { pipe, on: jest.fn() },
      contentLength: 3,
      contentType: 'image/png',
    } as never)
    const controller = buildController({
      getObjectStream: getObjectStream as StorageService['getObjectStream'],
    })
    const res = buildResponse()

    await controller.serve(request(['tracks', 'covers', 'a.png']), res as unknown as Response)

    expect(getObjectStream).toHaveBeenCalledWith('tracks/covers/a.png', undefined)
    expect(pipe).toHaveBeenCalledWith(res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'image/png',
        'Content-Length': 3,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      }),
    )
  })

  it('honors a Range request', async () => {
    const getObjectStream = jest.fn().mockResolvedValue({
      stream: { pipe: jest.fn(), on: jest.fn() },
      contentRange: 'bytes 0-1/3',
      contentType: 'image/webp',
    } as never)
    const controller = buildController({
      getObjectStream: getObjectStream as StorageService['getObjectStream'],
    })
    const res = buildResponse()

    await controller.serve(request('users/avatars/a.webp', 'bytes=0-1'), res as unknown as Response)

    expect(getObjectStream).toHaveBeenCalledWith('users/avatars/a.webp', 'bytes=0-1')
    expect(res.status).toHaveBeenCalledWith(206)
  })

  it('answers 404 when the object is missing', async () => {
    const controller = buildController({
      getObjectStream: jest
        .fn()
        .mockRejectedValue(new Error('NoSuchKey') as never) as StorageService['getObjectStream'],
    })
    await expect(
      controller.serve(request(['tracks', 'covers', 'gone.png']), buildResponse() as never),
    ).rejects.toThrow(NotFoundException)
  })

  it.each([
    [['..', 'etc', 'passwd']],
    [['tracks', '..', 'covers', 'a.png']],
    [['tracks', 'covers', '..%2f..%2fa.png']],
    [['tracks', 'covers', 'a.svg']],
    [['tracks', '1234', 'generations', 'x', 'audio', 'master.opus']],
    [['private', 'x.png']],
    [['tracks', 'covers']],
  ])('never reaches storage for %j', async (path) => {
    const getObjectStream = jest.fn()
    const controller = buildController({
      getObjectStream: getObjectStream as unknown as StorageService['getObjectStream'],
    })
    await expect(controller.serve(request(path), buildResponse() as never)).rejects.toThrow(
      NotFoundException,
    )
    expect(getObjectStream).not.toHaveBeenCalled()
  })
})
