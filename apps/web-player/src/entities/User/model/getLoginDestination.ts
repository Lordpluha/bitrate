import { ROUTES } from '@/shared/routes'

export const getLoginDestination = (response: unknown) => {
  if (
    typeof response === 'object' &&
    response !== null &&
    'requires2fa' in response &&
    response.requires2fa === true
  ) {
    return ROUTES.auth.twoFactorLogin
  }

  return ROUTES.main
}
