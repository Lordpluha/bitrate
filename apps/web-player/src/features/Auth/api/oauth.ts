import { getApiUrl } from '@shared/utils/mediaUrl'

export const activeOAuthProviders = ['google', 'facebook'] as const

export type ActiveOAuthProvider = (typeof activeOAuthProviders)[number]

export const getOAuthUrl = (provider: ActiveOAuthProvider) =>
  getApiUrl(`/api/v1/auth/oauth/${provider}`)
