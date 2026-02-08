import { registerAs } from '@nestjs/config'

export const cookieConfig = registerAs('cookie', () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}))
