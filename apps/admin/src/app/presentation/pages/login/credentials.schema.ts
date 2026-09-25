import { z } from 'zod'
import type { Credentials } from '@domain/staff'

/**
 * What the sign-in form accepts before it becomes a domain `Credentials`.
 *
 * It lives here rather than in `infrastructure` because these are input rules with messages an
 * operator reads, not the wire shape — that one is `signInBodyDto`, bound to the contract.
 * `z.email()` alone would answer "invalid email" for an untouched field, which is why the
 * emptiness check comes first and pipes into it.
 */
export const credentialsSchema = z.object({
  email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
}) satisfies z.ZodType<Credentials>
