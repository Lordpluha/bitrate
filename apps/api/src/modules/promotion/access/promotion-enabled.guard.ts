import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { PromotionAccessService } from './promotion-access.service'

/** Runs after `ArtistAuth`, which attaches the signed-in artist to the request. */
@Injectable()
export class PromotionEnabledGuard implements CanActivate {
  constructor(private readonly access: PromotionAccessService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ artist?: { promotionEnabled: boolean } }>()
    if (request.artist && this.access.isEnabled(request.artist)) return true
    throw new ForbiddenException(PROMOTION_ERRORS.DISABLED)
  }
}
