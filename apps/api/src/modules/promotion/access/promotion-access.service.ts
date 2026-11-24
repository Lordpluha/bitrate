import { Inject, Injectable } from '@nestjs/common'
import { PROMOTION_MODELS, type PromotionModels } from '../ai/generator'

/**
 * Who may use AI promotion (spec rollout, step 10): the deployment must have
 * `PROMOTION_AI_ENABLED` on, and the artist must have `promotionEnabled` set. The flag lets the
 * owner's account go first, then beta artists.
 */
@Injectable()
export class PromotionAccessService {
  constructor(
    /** `null` while `PROMOTION_AI_ENABLED` is off. */
    @Inject(PROMOTION_MODELS) private readonly models: PromotionModels | null,
  ) {}

  isEnabled(artist: { promotionEnabled: boolean }): boolean {
    return this.models !== null && artist.promotionEnabled
  }
}
