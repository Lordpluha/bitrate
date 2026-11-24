import { describe, expect, it } from '@jest/globals'
import type { ExecutionContext } from '@nestjs/common'
import { ForbiddenException } from '@nestjs/common'
import type { PromotionModels } from '../ai/generator'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { PromotionAccessService } from './promotion-access.service'
import { PromotionEnabledGuard } from './promotion-enabled.guard'

const MODELS = {} as PromotionModels

const contextFor = (artist: { promotionEnabled: boolean } | undefined) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ artist }) }),
  }) as unknown as ExecutionContext

describe('PromotionAccessService', () => {
  it('needs both the deployment switch and the artist flag', () => {
    expect(new PromotionAccessService(MODELS).isEnabled({ promotionEnabled: true })).toBe(true)
    expect(new PromotionAccessService(MODELS).isEnabled({ promotionEnabled: false })).toBe(false)
    expect(new PromotionAccessService(null).isEnabled({ promotionEnabled: true })).toBe(false)
  })
})

describe('PromotionEnabledGuard', () => {
  const guard = (models: PromotionModels | null) =>
    new PromotionEnabledGuard(new PromotionAccessService(models))

  it('lets an enabled artist through', () => {
    expect(guard(MODELS).canActivate(contextFor({ promotionEnabled: true }))).toBe(true)
  })

  it.each([
    ['an artist without the flag', MODELS, { promotionEnabled: false }],
    ['a deployment with AI off', null, { promotionEnabled: true }],
    ['a request without an artist', MODELS, undefined],
  ])('refuses %s', (_case, models, artist) => {
    expect(() => guard(models).canActivate(contextFor(artist))).toThrow(
      new ForbiddenException(PROMOTION_ERRORS.DISABLED),
    )
  })
})
