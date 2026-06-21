import { registerAs } from '@nestjs/config'

/** The cookie config value. */
export const cookieConfig = registerAs('cookie', () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}))
