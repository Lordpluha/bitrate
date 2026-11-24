import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { resetDatabase } from '../helpers/db'
import { closeE2eApp, createE2eApp, registerAndLogin } from './e2e-app'

/**
 * The web channel of the support assistant (#571). `.env.test` configures no chat model, so
 * every turn takes the "assistant unavailable" path: deterministic, and what production does
 * when the keys or the budget run out.
 */
describe('Support chat (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const setup = await createE2eApp()
    app = setup.app
    prisma = setup.prisma
  })

  afterAll(async () => closeE2eApp(app))

  beforeEach(async () => {
    await prisma.supportConversation.deleteMany()
    await resetDatabase(prisma)
  })

  const server = () => app.getHttpServer()

  async function startGuest() {
    const res = await request(server())
      .post('/support/conversations')
      .send({ audience: 'listener', locale: 'uk' })
      .expect(201)
    return { id: res.body.conversation.id as string, token: res.body.token as string }
  }

  const send = (id: string, text: string, token?: string) => {
    const req = request(server()).post(`/support/conversations/${id}/messages`).send({ text })
    return (token ? req.set('x-support-token', token) : req).buffer(true).parse((res, callback) => {
      // Collect the Server-Sent Events body as text; supertest does not buffer the type.
      let body = ''
      res.on('data', (chunk: Buffer) => {
        body += chunk.toString()
      })
      res.on('end', () => callback(null, body))
    })
  }

  it('lets a guest start a conversation and hands it to an operator when no model is set up', async () => {
    const { id, token } = await startGuest()
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)

    const res = await send(id, 'Як видалити акаунт?', token).expect(200)

    expect(res.headers['content-type']).toContain('text/event-stream')
    expect(res.body).toContain(
      'event: state\ndata: {"state":"waiting_operator","reason":"assistant_unavailable"}',
    )
    expect(res.body).toContain('event: done\ndata: {"outcome":"handed-off","grounded":false}')
    expect(res.body).toMatch(/Оператор/)

    const view = await request(server())
      .get(`/support/conversations/${id}`)
      .set('x-support-token', token)
      .expect(200)
    expect(view.body).toMatchObject({
      audience: 'listener',
      locale: 'uk',
      state: 'waiting_operator',
    })
    expect(view.body.messages.map((m: { role: string }) => m.role)).toEqual(['user', 'assistant'])
    const ticket = await prisma.supportTicket.findUnique({ where: { conversationId: id } })
    expect(ticket).toMatchObject({ status: 'OPEN', reason: 'assistant_unavailable' })
  })

  it('keeps a person in charge: later messages are only stored', async () => {
    const { id, token } = await startGuest()
    await send(id, 'Hello', token).expect(200)

    const res = await send(id, 'Any news?', token).expect(200)

    expect(res.body).toBe('event: done\ndata: {"outcome":"forwarded","grounded":false}\n\n')
    expect(await prisma.supportMessage.count({ where: { conversationId: id } })).toBe(3)
  })

  it('hides a conversation from anyone without its token', async () => {
    const { id } = await startGuest()
    const other = await startGuest()

    await request(server()).get(`/support/conversations/${id}`).expect(404)
    await request(server())
      .get(`/support/conversations/${id}`)
      .set('x-support-token', other.token)
      .expect(404)
    await send(id, 'Hello', other.token).expect(404)
  })

  it('ties a signed-in listener’s conversation to them, without a token', async () => {
    const owner = await registerAndLogin(app, 'user')
    const stranger = await registerAndLogin(app, 'user')

    const created = await request(server())
      .post('/support/conversations')
      .set('Cookie', owner.cookies)
      .send({ audience: 'listener' })
      .expect(201)

    expect(created.body.token).toBeUndefined()
    const id = created.body.conversation.id as string
    await request(server())
      .get(`/support/conversations/${id}`)
      .set('Cookie', owner.cookies)
      .expect(200)
    await request(server())
      .get(`/support/conversations/${id}`)
      .set('Cookie', stranger.cookies)
      .expect(404)
  })

  it('rejects empty and oversized messages before any work', async () => {
    const { id, token } = await startGuest()

    await send(id, '   ', token).expect(400)
    await send(id, 'x'.repeat(2_001), token).expect(400)
    expect(await prisma.supportMessage.count({ where: { conversationId: id } })).toBe(0)
  })
})
