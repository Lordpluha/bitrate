import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, type Permission } from '@modules/admin-auth'
import { SupportInboxService } from '@modules/support'
import { type INestApplication, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { StubAdminAuthGuard } from '@test/mocks/stub-admin-auth.guard'
import request from 'supertest'
import { AdminSupportController } from './admin-support.controller'

const ID = '0196f1a0-0000-7000-8000-000000000001'

const makeInbox = () =>
  ({
    list: jest.fn(async () => ({ data: [], total: 0, page: 1, limit: 20 })),
    view: jest.fn(async () => ({ id: ID })),
    reply: jest.fn(async () => ({ id: ID, state: 'operator' })),
    resolve: jest.fn(async () => ({ id: ID, state: 'resolved' })),
  }) as unknown as jest.Mocked<SupportInboxService>

async function start(permissions: Permission[]) {
  const inbox = makeInbox()
  const module = await Test.createTestingModule({
    controllers: [AdminSupportController],
    providers: [{ provide: SupportInboxService, useValue: inbox }],
  })
    .overrideGuard(AdminAuthGuard)
    .useValue(new StubAdminAuthGuard(new Reflector(), permissions))
    .compile()
  const app = module.createNestApplication()
  await app.init()
  return { app, inbox }
}

describe('AdminSupportController (int)', () => {
  let app: INestApplication

  afterEach(() => app.close())

  it('lists with validated filters', async () => {
    const started = await start(['support:read'])
    app = started.app

    await request(app.getHttpServer())
      .get('/admin/support/conversations?status=open&channel=web&audience=artist&page=2')
      .expect(200)

    expect(started.inbox.list).toHaveBeenCalledWith({
      status: 'open',
      channel: 'web',
      audience: 'artist',
      page: 2,
    })
  })

  it('rejects an unknown filter value', async () => {
    const started = await start(['support:read'])
    app = started.app

    await request(app.getHttpServer()).get('/admin/support/conversations?status=closed').expect(400)
    expect(started.inbox.list).not.toHaveBeenCalled()
  })

  it('maps a conversation without a ticket to 404 and rejects a malformed id', async () => {
    const started = await start(['support:read'])
    app = started.app
    started.inbox.view.mockRejectedValueOnce(new NotFoundException())

    await request(app.getHttpServer()).get(`/admin/support/conversations/${ID}`).expect(404)
    await request(app.getHttpServer()).get('/admin/support/conversations/not-a-uuid').expect(400)
  })

  it('denies replying and resolving with read access only', async () => {
    const started = await start(['support:read'])
    app = started.app

    await request(app.getHttpServer())
      .post(`/admin/support/conversations/${ID}/messages`)
      .send({ text: 'Hello' })
      .expect(403)
    await request(app.getHttpServer())
      .post(`/admin/support/conversations/${ID}/resolve`)
      .expect(403)
    expect(started.inbox.reply).not.toHaveBeenCalled()
    expect(started.inbox.resolve).not.toHaveBeenCalled()
  })

  it('denies reading without support:read', async () => {
    const started = await start(['reports:read'])
    app = started.app

    await request(app.getHttpServer()).get('/admin/support/conversations').expect(403)
  })

  it('replies with trimmed text and rejects a blank reply', async () => {
    const started = await start(['support:reply'])
    app = started.app

    await request(app.getHttpServer())
      .post(`/admin/support/conversations/${ID}/messages`)
      .send({ text: '  We are on it  ' })
      .expect(200)
    expect(started.inbox.reply).toHaveBeenCalledWith(ID, 'We are on it')

    await request(app.getHttpServer())
      .post(`/admin/support/conversations/${ID}/messages`)
      .send({ text: '   ' })
      .expect(400)
  })

  it('resolves', async () => {
    const started = await start(['support:reply'])
    app = started.app

    await request(app.getHttpServer())
      .post(`/admin/support/conversations/${ID}/resolve`)
      .expect(200)
    expect(started.inbox.resolve).toHaveBeenCalledWith(ID)
  })
})
