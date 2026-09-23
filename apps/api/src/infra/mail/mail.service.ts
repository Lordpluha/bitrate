import type { AppConfig } from '@common/config'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { DEFAULT_MAIL_LOCALE, type MailLocale } from './templates/mail-locale'
import { MAIL_TEMPLATES } from './templates/registry'

/** Represents the mail service. */
@Injectable()
export class MailService {
  /** The logger value. */
  private readonly logger = new Logger(MailService.name)
  /** The transporter value. */
  private readonly transporter: nodemailer.Transporter | null

  /** Creates a new instance. */
  constructor(private readonly config: ConfigService<AppConfig>) {
    const mail = config.get('mail')
    if (mail?.host) {
      this.transporter = nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        // Implicit TLS on 465 and on 2465, the alternative many hosts leave open when they
        // block the standard SMTP ports. 587 and 2587 upgrade through STARTTLS instead, which
        // nodemailer does on its own when `secure` is false.
        secure: mail.port === 465 || mail.port === 2465,
        ...(mail.user && mail.pass ? { auth: { user: mail.user, pass: mail.pass } } : {}),
      })
    } else {
      if ((config.get('NODE_ENV') ?? process.env.NODE_ENV) === 'production') {
        throw new Error('SMTP is required in production but is not configured')
      }
      this.transporter = null
      this.logger.warn('SMTP not configured — transactional emails cannot be delivered')
    }
  }

  /**
   * Sends a password-reset link, in the recipient's stored locale. Callers pass `locale`
   * explicitly — this method never reads `Accept-Language`, since a password-reset mail is
   * often sent from a BullMQ job with no request context at all.
   */
  sendPasswordReset(
    to: string,
    token: string,
    username: string,
    locale: MailLocale = DEFAULT_MAIL_LOCALE,
  ) {
    return this.sendPasswordResetForHost(
      to,
      token,
      username,
      this.config.getOrThrow('web').userHost,
      locale,
    )
  }

  /** Sends an artist password reset to the artist frontend, in the recipient's stored locale. */
  sendArtistPasswordReset(
    to: string,
    token: string,
    username: string,
    locale: MailLocale = DEFAULT_MAIL_LOCALE,
  ) {
    return this.sendPasswordResetForHost(
      to,
      token,
      username,
      this.config.getOrThrow('web').artistHost,
      locale,
    )
  }

  private async sendPasswordResetForHost(
    to: string,
    token: string,
    username: string,
    webHost: string,
    locale: MailLocale,
  ) {
    const resetUrl = `${webHost}/reset-password?token=${encodeURIComponent(token)}`

    if (!this.transporter) {
      this.handleUndelivered('Password reset', to, resetUrl)
      return
    }

    const from = this.config.getOrThrow('mail').from
    const { subject, html } = MAIL_TEMPLATES[locale].passwordReset({
      username,
      url: resetUrl,
    })

    await this.transporter.sendMail({ from, to, subject, html })

    this.logger.log(`Password reset email sent to ${to}`)
  }

  /** Sends a user email-verification link, in the recipient's stored locale. */
  async sendEmailVerification(
    to: string,
    token: string,
    username: string,
    locale: MailLocale = DEFAULT_MAIL_LOCALE,
  ) {
    const verificationUrl = `${this.config.getOrThrow('web').userHost}/verify-email?token=${encodeURIComponent(token)}`

    if (!this.transporter) {
      this.handleUndelivered('Email verification', to, verificationUrl)
      return
    }

    const from = this.config.getOrThrow('mail').from
    const { subject, html } = MAIL_TEMPLATES[locale].emailVerification({
      username,
      url: verificationUrl,
    })

    await this.transporter.sendMail({ from, to, subject, html })
  }

  /** Sends an artist email-verification link, in the recipient's stored locale. */
  async sendArtistEmailVerification(
    to: string,
    token: string,
    username: string,
    locale: MailLocale = DEFAULT_MAIL_LOCALE,
  ) {
    const verificationUrl = `${this.config.getOrThrow('web').artistHost}/verify-email?token=${encodeURIComponent(token)}`
    if (!this.transporter) {
      this.handleUndelivered('Artist email verification', to, verificationUrl)
      return
    }
    const from = this.config.getOrThrow('mail').from
    const { subject, html } = MAIL_TEMPLATES[locale].emailVerification({
      username,
      url: verificationUrl,
    })

    await this.transporter.sendMail({ from, to, subject, html })
  }

  private handleUndelivered(kind: string, to: string, url: string) {
    if (this.config.get('mail')?.logTokens) {
      this.logger.warn(`[DEV MAIL] ${kind} for ${to}: ${url}`)
      return
    }

    this.logger.warn(`${kind} requested but SMTP is not configured; email not sent`, { to })
  }
}
