import { renderEmailVerification as renderEmailVerificationEn } from './en/email-verification.template'
import { renderPasswordReset as renderPasswordResetEn } from './en/password-reset.template'
import type { MailLocale } from './mail-locale'
import type { LinkMailParams, RenderedMail } from './mail-template.types'
import { renderEmailVerification as renderEmailVerificationUk } from './uk/email-verification.template'
import { renderPasswordReset as renderPasswordResetUk } from './uk/password-reset.template'

/** The link-style templates every locale must provide. */
type LinkTemplateSet = {
  passwordReset: (params: LinkMailParams) => RenderedMail
  emailVerification: (params: LinkMailParams) => RenderedMail
}

/**
 * Every mail template, indexed by locale. Adding a locale means adding one entry here —
 * a missing key is a compile error, not a silent fallback to English text.
 */
export const MAIL_TEMPLATES: Record<MailLocale, LinkTemplateSet> = {
  en: { passwordReset: renderPasswordResetEn, emailVerification: renderEmailVerificationEn },
  uk: { passwordReset: renderPasswordResetUk, emailVerification: renderEmailVerificationUk },
}
