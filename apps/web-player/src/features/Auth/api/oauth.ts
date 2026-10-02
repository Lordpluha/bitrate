import { getApiUrl } from '@shared/utils/mediaUrl'

const activeOAuthProviders = ['google', 'facebook'] as const

export type ActiveOAuthProvider = (typeof activeOAuthProviders)[number]

/**
 * Starts the social sign-in flow. `acceptLegal` tells the API the user was shown the
 * Terms of Use, Community Guidelines and Privacy Policy next to the button, which it requires before it will
 * create a new account.
 */
export const getOAuthUrl = (
  provider: ActiveOAuthProvider,
  { acceptLegal }: { acceptLegal: boolean },
) => {
  const query = acceptLegal ? '?acceptLegal=true' : ''
  return getApiUrl(`/api/v1/auth/oauth/${provider}${query}`)
}
