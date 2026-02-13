import { afterAll, beforeAll, describe, it } from '@jest/globals'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { closeE2eApp, createE2eApp } from './e2e-app'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
  })

  afterAll(async () => {
    await closeE2eApp(app)
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Welcome to @spotify/api!')
  })
})
