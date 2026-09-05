import type { AppConfig } from '@common/config'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import { mockDeep } from 'jest-mock-extended'
import { MailService } from './mail.service'

describe('MailService audience-specific links', () => {
  let service: MailService
  let sendMail: jest.MockedFunction<(payload: { html: string }) => Promise<void>>

  beforeEach(() => {
    const config = mockDeep<ConfigService<AppConfig>>()
    config.get.mockReturnValue(undefined)
    config.getOrThrow.mockImplementation((key) => {
      if (key === 'web') {
        return {
          userHost: 'https://users.example.com',
          artistHost: 'https://artists.example.com',
        } as never
      }
      if (key === 'mail') return { from: 'security@example.com' } as never
      throw new Error(`Unexpected config key: ${String(key)}`)
    })
    service = new MailService(config)
    sendMail = jest.fn(async () => undefined)
    Object.defineProperty(service, 'transporter', { value: { sendMail } })
  })

  it('routes password-reset links to the matching frontend', async () => {
    await service.sendPasswordReset('user@example.com', 'user token', 'user')
    await service.sendArtistPasswordReset('artist@example.com', 'artist token', 'artist')

    expect(sendMail.mock.calls[0]?.[0].html).toContain(
      'https://users.example.com/reset-password?token=user%20token',
    )
    expect(sendMail.mock.calls[1]?.[0].html).toContain(
      'https://artists.example.com/reset-password?token=artist%20token',
    )
  })

  it('routes verification links to the matching frontend', async () => {
    await service.sendEmailVerification('user@example.com', 'user-token', 'user')
    await service.sendArtistEmailVerification('artist@example.com', 'artist-token', 'artist')

    expect(sendMail.mock.calls[0]?.[0].html).toContain(
      'https://users.example.com/verify-email?token=user-token',
    )
    expect(sendMail.mock.calls[1]?.[0].html).toContain(
      'https://artists.example.com/verify-email?token=artist-token',
    )
  })
})

describe('MailService development fallback policy', () => {
  const makeConfig = (logTokens: boolean, nodeEnv = 'development') => {
    const config = mockDeep<ConfigService<AppConfig>>()
    config.get.mockImplementation((key) => {
      if (key === 'NODE_ENV') return nodeEnv as never
      if (key === 'mail') return { logTokens } as never
      return undefined
    })
    config.getOrThrow.mockImplementation((key) => {
      if (key === 'web') {
        return {
          userHost: 'https://users.example.com',
          artistHost: 'https://artists.example.com',
        } as never
      }
      throw new Error(`Unexpected config key: ${String(key)}`)
    })
    return config
  }

  it('does not expose a token when the explicit development flag is disabled', async () => {
    const service = new MailService(makeConfig(false))
    const logger = Reflect.get(service, 'logger') as { warn: (...args: unknown[]) => void }
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => undefined)

    await service.sendEmailVerification('user@example.com', 'sensitive-token', 'user')

    expect(JSON.stringify(warn.mock.calls)).not.toContain('sensitive-token')
    expect(warn).toHaveBeenCalledWith(
      'Email verification requested but SMTP is not configured; email not sent',
      { to: 'user@example.com' },
    )
  })

  it('prints a complete URL only after explicit development opt-in', async () => {
    const service = new MailService(makeConfig(true))
    const logger = Reflect.get(service, 'logger') as { warn: (...args: unknown[]) => void }
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => undefined)

    await service.sendEmailVerification('user@example.com', 'sensitive token', 'user')

    expect(warn).toHaveBeenCalledWith(
      '[DEV MAIL] Email verification for user@example.com: https://users.example.com/verify-email?token=sensitive%20token',
    )
  })

  it('fails startup when production SMTP is missing', () => {
    expect(() => new MailService(makeConfig(false, 'production'))).toThrow(
      'SMTP is required in production but is not configured',
    )
  })
})
