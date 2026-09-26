import type { Credentials, Staff } from './staff'

/**
 * The port the session use cases talk to.
 *
 * `currentStaff` resolves to `null` rather than rejecting, because "no valid session" is an
 * answer, not a failure — the token lives in an httpOnly cookie, so asking the API is the only
 * way to find out.
 */
export abstract class StaffSessionRepository {
  abstract signIn(credentials: Credentials): Promise<Staff>
  abstract currentStaff(): Promise<Staff | null>
  abstract signOut(): Promise<void>
}
