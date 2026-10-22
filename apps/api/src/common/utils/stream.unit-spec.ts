import { PassThrough, Readable } from 'node:stream'
import { describe, expect, it, jest } from '@jest/globals'
import type { Logger } from '@nestjs/common'
import type { Response } from 'express'
import { pipeToResponse } from './stream'

const buildLogger = () => ({ warn: jest.fn() }) as unknown as Logger & { warn: jest.Mock }

const settle = () => new Promise((resolve) => setImmediate(resolve))

describe('pipeToResponse', () => {
  it('streams every byte of the source into the response', async () => {
    const response = new PassThrough()
    const chunks: Buffer[] = []
    response.on('data', (chunk: Buffer) => chunks.push(chunk))

    pipeToResponse(
      Readable.from([Buffer.from('ab'), Buffer.from('cd')]),
      response as unknown as Response,
      buildLogger(),
      'asset',
    )
    await settle()

    expect(Buffer.concat(chunks).toString()).toBe('abcd')
  })

  it('destroys the response and logs when the source fails mid-transfer', async () => {
    const source = new PassThrough()
    const response = new PassThrough()
    const logger = buildLogger()

    pipeToResponse(source, response as unknown as Response, logger, 'asset')
    source.destroy(new Error('storage reset'))
    await settle()

    expect(response.destroyed).toBe(true)
    expect(logger.warn).toHaveBeenCalledWith('asset stream failed: storage reset')
  })

  it('releases the source when the client goes away, without logging', async () => {
    const source = new PassThrough()
    const response = new PassThrough()
    const logger = buildLogger()

    pipeToResponse(source, response as unknown as Response, logger, 'asset')
    response.destroy()
    await settle()

    expect(source.destroyed).toBe(true)
    expect(logger.warn).not.toHaveBeenCalled()
  })
})
