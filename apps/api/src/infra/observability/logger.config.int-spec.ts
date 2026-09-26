import { Writable } from 'node:stream'
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { Controller, Get, type INestApplication, VersioningType } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { Logger, LoggerModule } from 'nestjs-pino'
import type { Options } from 'pino-http'
import request from 'supertest'
import { loggerOptions } from './logger.config'

@Controller({ version: '1' })
class PingController {
  @Get('ping')
  ping() {
    return { ok: true }
  }

  @Get('metrics')
  metrics() {
    return '# metrics\n'
  }
}

describe('logger.config (int)', () => {
  let app: INestApplication
  let lines: unknown[]

  beforeAll(async () => {
    lines = []
    const captureStream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        for (const line of chunk.toString('utf8').split('\n')) {
          if (line.trim().length > 0) lines.push(JSON.parse(line))
        }
        callback()
      },
    })

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          ...loggerOptions,
          pinoHttp: [loggerOptions.pinoHttp as Options, captureStream],
        }),
      ],
      controllers: [PingController],
    }).compile()

    app = module.createNestApplication({ bufferLogs: true })
    app.useLogger(app.get(Logger))
    app.setGlobalPrefix('api')
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('auto-logs an ordinary request', async () => {
    lines = []
    await request(app.getHttpServer()).get('/api/v1/ping').expect(200)

    expect(lines.some((line) => typeof line === 'object' && line !== null)).toBe(true)
  })

  it('does not auto-log the Prometheus scrape route, under the real global prefix and version', async () => {
    lines = []
    await request(app.getHttpServer()).get('/api/v1/metrics').expect(200)

    expect(lines).toHaveLength(0)
  })
})
