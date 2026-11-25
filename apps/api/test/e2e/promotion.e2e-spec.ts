import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { registerAndLogin } from './e2e-app'
import { createPromotionE2eApp } from './promotion-app'

const DAY_MS = 86_400_000
const STEP = (offsetDays: number, kind: string, title: string) => ({
  offsetDays,
  kind,
  channels: kind === 'POST' ? ['INSTAGRAM'] : [],
  title,
  body: 'Keep it short and in your own words.',
})
/** What the fake model answers for a plan: grounded text, offsets across the whole window. */
const PLAN = {
  steps: [
    STEP(-21, 'POST', 'Announce the release'),
    STEP(-7, 'POST', 'Share a short hook'),
    STEP(0, 'FOLLOWER_MESSAGE', 'Thank your followers'),
    STEP(14, 'ACTION', 'Ask a friend to share it'),
  ],
}
const PROFILE = {
  goal: 'BUZZ',
  channels: ['INSTAGRAM'],
  weeklyHours: 3,
  countries: ['UA'],
  audience: null,
  voiceWords: ['calm'],
  voiceExamples: [],
}

/**
 * AI promotion end to end (spec AC-1, AC-2, AC-3, AC-12): the HTTP API, the BullMQ job and the
 * database, with a fake model in place of every provider.
 */
describe('AI promotion (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  const artists: string[] = []

  beforeAll(async () => {
    const setup = await createPromotionE2eApp(() => PLAN)
    app = setup.app
    prisma = setup.prisma
  })

  afterEach(async () => {
    if (!prisma) return
    await prisma.release.deleteMany({ where: { ownerArtistId: { in: artists } } })
    await prisma.artistSession.deleteMany({ where: { artistId: { in: artists } } })
    await prisma.artist.deleteMany({ where: { id: { in: artists } } })
    artists.length = 0
  })

  afterAll(async () => app?.close())

  const server = () => app.getHttpServer()

  /** A signed-in artist with promotion on (unless `enabled` is false) and a profile. */
  async function artist({ enabled = true, profile = true } = {}) {
    const { cookies, email } = await registerAndLogin(app, 'artist')
    const { id } = await prisma.artist.update({
      where: { email },
      data: { promotionEnabled: enabled },
      select: { id: true },
    })
    artists.push(id)
    if (profile && enabled) {
      await request(server())
        .put('/artists/me/promotion-profile')
        .set('Cookie', cookies)
        .send(PROFILE)
        .expect(200)
    }
    return { id, cookies }
  }

  const release = (ownerArtistId: string, scheduledAt: Date | null) =>
    prisma.release.create({
      data: { ownerArtistId, title: 'Afterglow', scheduledAt },
      select: { id: true },
    })

  /** Polls the latest plan until the background job settles it. */
  async function settledPlan(cookies: string[], releaseId: string) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const res = await request(server())
        .get(`/artists/me/releases/${releaseId}/promotion/plans/latest`)
        .set('Cookie', cookies)
        .expect(200)
      if (res.body.status !== 'GENERATING') return res.body
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
    throw new Error('The plan was still generating after 10 s')
  }

  it('generates a dated plan between four weeks before and after the release (AC-1)', async () => {
    const { id, cookies } = await artist()
    const scheduledAt = new Date(Date.now() + 40 * DAY_MS)
    const { id: releaseId } = await release(id, scheduledAt)

    const started = await request(server())
      .post(`/artists/me/releases/${releaseId}/promotion/plans`)
      .set('Cookie', cookies)
      .expect(202)
    expect(started.body).toMatchObject({ version: 1, status: 'GENERATING' })

    const plan = await settledPlan(cookies, releaseId)
    expect(plan.status).toBe('READY')
    expect(plan.steps).toHaveLength(4)
    for (const step of plan.steps) {
      expect(step.offsetDays).toBeGreaterThanOrEqual(-28)
      expect(step.offsetDays).toBeLessThanOrEqual(28)
      expect(Date.parse(step.dueAt)).toBe(scheduledAt.getTime() + step.offsetDays * DAY_MS)
      expect(step).toMatchObject({ state: 'SUGGESTED', aiGenerated: true })
    }
    const events = await prisma.promotionEvent.count({
      where: { artistId: id, name: 'promotion.plan.generated' },
    })
    expect(events).toBe(1)
  })

  it('moves every step when the release date moves (AC-3)', async () => {
    const { id, cookies } = await artist()
    const scheduledAt = new Date(Date.now() + 40 * DAY_MS)
    const { id: releaseId } = await release(id, scheduledAt)
    await request(server())
      .post(`/artists/me/releases/${releaseId}/promotion/plans`)
      .set('Cookie', cookies)
      .expect(202)
    const before = await settledPlan(cookies, releaseId)

    await prisma.release.update({
      where: { id: releaseId },
      data: { scheduledAt: new Date(scheduledAt.getTime() + 7 * DAY_MS) },
    })
    const after = await settledPlan(cookies, releaseId)
    after.steps.forEach((step: { dueAt: string }, index: number) => {
      expect(Date.parse(step.dueAt) - Date.parse(before.steps[index].dueAt)).toBe(7 * DAY_MS)
    })
  })

  it('asks for a release date first (AC-2)', async () => {
    const { id, cookies } = await artist()
    const { id: releaseId } = await release(id, null)
    const res = await request(server())
      .post(`/artists/me/releases/${releaseId}/promotion/plans`)
      .set('Cookie', cookies)
      .expect(409)
    expect(JSON.stringify(res.body)).toContain('errors.promotion.release_date_required')
  })

  it('records every model call and stops at the monthly allowance (AC-12)', async () => {
    const { id, cookies } = await artist()
    const { id: releaseId } = await release(id, new Date(Date.now() + 40 * DAY_MS))
    await request(server())
      .post(`/artists/me/releases/${releaseId}/promotion/plans`)
      .set('Cookie', cookies)
      .expect(202)
    await settledPlan(cookies, releaseId)
    expect(await prisma.aiUsage.count({ where: { artistId: id, outcome: 'SUCCEEDED' } })).toBe(1)

    await prisma.aiUsage.create({
      data: {
        artistId: id,
        feature: 'promotion',
        task: 'plan',
        provider: 'anthropic',
        model: 'claude-sonnet-5-5',
        inputTokens: 0,
        outputTokens: 0,
        costMicroUsd: 2_000_000,
        outcome: 'SUCCEEDED',
      },
    })
    const res = await request(server())
      .post(`/artists/me/releases/${releaseId}/promotion/plans`)
      .set('Cookie', cookies)
      .expect(402)
    expect(JSON.stringify(res.body)).toContain('errors.promotion.ai_quota_exceeded')
    const allowance = await request(server())
      .get('/artists/me/promotion/allowance')
      .set('Cookie', cookies)
      .expect(200)
    expect(allowance.body.usedMicroUsd).toBeGreaterThanOrEqual(allowance.body.limitMicroUsd)
  })

  it('keeps promotion closed to artists without the flag', async () => {
    const { cookies } = await artist({ enabled: false })
    const res = await request(server())
      .get('/artists/me/promotion-profile')
      .set('Cookie', cookies)
      .expect(403)
    expect(JSON.stringify(res.body)).toContain('errors.promotion.disabled')
    const allowance = await request(server())
      .get('/artists/me/promotion/allowance')
      .set('Cookie', cookies)
      .expect(200)
    expect(allowance.body.enabled).toBe(false)
  })
})
