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
    const pl = await request(app.getHttpServer())
      .get('/probe/missing')
      .set('Accept-Language', 'pl-PL,pl;q=0.9')

    expect(uk.status).toBe(404)
    expect(uk.body).toMatchObject({
      code: 'errors.track.not_found',
      message: 'Трек t-1 не знайдено',
    })
    expect(pl.body.message).toBe('Nie znaleziono utworu t-1')
  })

  it.each(['fr', 'ru-RU,ru;q=0.9', 'de'])(
    'AC1: an unsupported locale (%s) falls back to en',
    async (acceptLanguage) => {
      const res = await request(app.getHttpServer())
        .get('/probe/missing')
        .set('Accept-Language', acceptLanguage)

      expect(res.body).toMatchObject({
        code: 'errors.track.not_found',
        message: 'Track t-1 not found',
      })
    },
  )

  it('AC2: a zod failure answers with translated per-field messages', async () => {
    const res = await request(app.getHttpServer())
      .post('/probe/body')
      .set('Accept-Language', 'pl')
      .send({ name: 'a', email: 'x', count: 9, kind: 'z' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      code: 'errors.validation.failed',
      message: 'Walidacja nie powiodła się',
      error: 'Bad Request',
    })
    expect(res.body.errors).toEqual([
      {
        path: 'name',
        code: 'validation.too_small.string',
        message: 'Musi mieć co najmniej 3 znaków',
      },
      {
        path: 'email',
        code: 'validation.invalid_format.email',
        message: 'Podaj prawidłowy adres e-mail',
      },
      { path: 'count', code: 'validation.too_big.number', message: 'Musi być nie większe niż 5' },
      {
        path: 'kind',
        code: 'validation.invalid_value',
        message: 'Musi być jedną z wartości: a, b',
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
