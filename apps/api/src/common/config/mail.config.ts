import { registerAs } from '@nestjs/config'

/** The mail config value. */
export const mailConfig = registerAs('mail', () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM,
  logTokens: process.env.DEV_MAIL_LOG_TOKENS === 'true',
}))
