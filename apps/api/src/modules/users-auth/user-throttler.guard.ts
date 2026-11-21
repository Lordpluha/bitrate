import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

/** The shape of `req.user` this guard relies on; anything else counts by address. */
type TrackedUser = { id: string }

function isTrackedUser(value: unknown): value is TrackedUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === 'string'
  )
}

/**
 * Throttles a route per signed-in user instead of per address (ADR-0072), on top of the global
 * per-address `ThrottlerGuard`, so one account cannot multiply a limit by rotating addresses. It
 * must run after the auth guard that sets `req.user`; without a user it counts by address.
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    if (isTrackedUser(req.user)) return Promise.resolve(`user:${req.user.id}`)
    return super.getTracker(req)
  }
}
