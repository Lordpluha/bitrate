import type { AppConfig } from '@common/config'
import { escapeHtml } from '@common/utils/html'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

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
    if (mail?.host && mail?.user && mail?.pass) {
      this.transporter = nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        secure: mail.port === 465,
        auth: { user: mail.user, pass: mail.pass },
      })
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SMTP is required in production but is not configured')
      }
      this.transporter = null
      this.logger.warn(
        'SMTP not configured — password-reset emails will be skipped in this environment',
      )
    }
  }

  /** Runs the send password reset operation. */
  async sendPasswordReset(to: string, token: string, username: string) {
    const resetUrl = `${process.env.WEB_HOST}/reset-password?token=${encodeURIComponent(token)}`

    if (!this.transporter) {
      this.logger.warn('Password reset requested but SMTP is not configured; email not sent', {
        to,
      })
      return
    }

    const from = this.config.getOrThrow('mail').from

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Reset your password',
      html: `
        <h2>Hi, ${escapeHtml(username)}</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    })

    this.logger.log(`Password reset email sent to ${to}`)
  }

  /** Sends a user email-verification link. */
  async sendEmailVerification(to: string, token: string, username: string) {
    const verificationUrl = `${process.env.WEB_HOST}/verify-email?token=${encodeURIComponent(token)}`

    if (!this.transporter) {
      this.logger.warn('Email verification requested but SMTP is not configured; email not sent', {
        to,
      })
      return
    }

    const from = this.config.getOrThrow('mail').from
    await this.transporter.sendMail({
      from,
      to,
      subject: 'Verify your email',
      html: `
        <h2>Hi, ${escapeHtml(username)}</h2>
        <p>Confirm your email address to finish creating your account:</p>
        <p><a href="${escapeHtml(verificationUrl)}">${escapeHtml(verificationUrl)}</a></p>
        <p>This link expires in <strong>24 hours</strong>.</p>
      `,
    })
  }

  /** Sends an artist email-verification link. */
  async sendArtistEmailVerification(to: string, token: string, username: string) {
    const verificationUrl = `${process.env.WEB_HOST}/artist/verify-email?token=${encodeURIComponent(token)}`
    if (!this.transporter) {
      this.logger.warn('Artist email verification skipped because SMTP is not configured', { to })
      return
    }
    const from = this.config.getOrThrow('mail').from
    await this.transporter.sendMail({
      from,
      to,
      subject: 'Verify your artist email',
      html: `<h2>Hi, ${escapeHtml(username)}</h2><p><a href="${escapeHtml(verificationUrl)}">Verify your email</a></p><p>This link expires in 24 hours.</p>`,
    })
  }
}
