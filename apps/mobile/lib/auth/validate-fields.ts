import type { TranslationKey } from '@/lib/i18n/messages/en'

/** Field limits mirror the API's zod DTOs (`apps/api/src/modules/users-auth/dtos`). */
const PASSWORD_LENGTH = { min: 6, max: 32 }
const USERNAME_LENGTH = { min: 3, max: 20 }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOTP_CODE = /^\d{6}$/

type FieldError = TranslationKey | null

const withinLength = (value: string, { min, max }: { min: number; max: number }) =>
  value.length >= min && value.length <= max

export const validateEmail = (value: string): FieldError =>
  EMAIL.test(value.trim()) ? null : 'auth.validation.email'

export const validatePassword = (value: string): FieldError =>
  withinLength(value, PASSWORD_LENGTH) ? null : 'auth.validation.password'

export const validateUsername = (value: string): FieldError =>
  withinLength(value.trim(), USERNAME_LENGTH) ? null : 'auth.validation.username'

export const validateCode = (value: string): FieldError => (TOTP_CODE.test(value.trim()) ? null : 'auth.validation.code')
