import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { applyDecorators, HttpStatus, UseGuards } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { PromotionEnabledGuard } from './promotion-enabled.guard'

/**
 * A signed-in artist with AI promotion enabled. `applyDecorators` keeps the order, so the
 * artist is attached before the promotion guard reads it.
 */
export function PromotionAuth() {
  return applyDecorators(
    ArtistAuth(),
    UseGuards(PromotionEnabledGuard),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'AI promotion is not enabled' }),
  )
}
