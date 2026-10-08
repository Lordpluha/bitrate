import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'
import { TrackNotFoundException } from '@modules/tracks/errors'
import { Body, Controller, Get, type INestApplication, Post } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { I18nModule } from 'nestjs-i18n'
import { ZodValidationPipe } from 'nestjs-zod'
import request from 'supertest'
import { z } from 'zod'
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter'
import { i18nOptions } from '../../i18n/i18n.config'

const BodySchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  count: z.number().max(5),
  kind: z.enum(['a', 'b']),
})

@Controller('probe')
class ProbeController {
  @Get('missing')
  missing() {
    throw new TrackNotFoundException('t-1')
  }

  @Post('body')
  body(@Body(new ZodValidationPipe(BodySchema)) body: unknown) {
    return body
  }
}

describe('error localization through the real filter and dictionaries (int)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [I18nModule.forRoot(i18nOptions)],
      controllers: [ProbeController],
      providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
    }).compile()
    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  it('AC1: a keyed error carries its code and the Accept-Language message', async () => {
    const uk = await request(app.getHttpServer()).get('/probe/missing').set('Accept-Language', 'uk')
    const ru = await request(app.getHttpServer())
      .get('/probe/missing')
      .set('Accept-Language', 'ru-RU,ru;q=0.9')

    expect(uk.status).toBe(404)
    expect(uk.body).toMatchObject({
      code: 'errors.track.not_found',
      message: 'Трек t-1 не знайдено',
    })
    expect(ru.body.message).toBe('Трек t-1 не найден')
  })

  it('AC1: an unknown locale falls back to en', async () => {
    const res = await request(app.getHttpServer())
      .get('/probe/missing')
      .set('Accept-Language', 'fr')

    expect(res.body).toMatchObject({
      code: 'errors.track.not_found',
      message: 'Track t-1 not found',
    })
  })

  it('AC2: a zod failure answers with translated per-field messages', async () => {
    const res = await request(app.getHttpServer())
      .post('/probe/body')
      .set('Accept-Language', 'de')
      .send({ name: 'a', email: 'x', count: 9, kind: 'z' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      code: 'errors.validation.failed',
      message: 'Validierung fehlgeschlagen',
      error: 'Bad Request',
    })
    expect(res.body.errors).toEqual([
      {
        path: 'name',
        code: 'validation.too_small.string',
        message: 'Muss mindestens 3 Zeichen lang sein',
      },
      {
        path: 'email',
        code: 'validation.invalid_format.email',
        message: 'Geben Sie eine gültige E-Mail-Adresse ein',
      },
      { path: 'count', code: 'validation.too_big.number', message: 'Darf höchstens 5 betragen' },
      {
        path: 'kind',
        code: 'validation.invalid_value',
        message: 'Muss einer der folgenden Werte sein: a, b',
      },
    ])
  })

  it('AC2: the same failure in en reads in English', async () => {
    const res = await request(app.getHttpServer()).post('/probe/body').send({})

    expect(res.body.errors[0]).toEqual({
      path: 'name',
      code: 'validation.required',
      message: 'This field is required',
    })
  })
})
