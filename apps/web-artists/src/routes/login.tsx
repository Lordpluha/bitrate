import { createFileRoute } from '@tanstack/react-router'
import { LoginView } from '@views/LoginView'

interface LoginSearch {
  next?: string
  addAccount?: boolean
  /** Why a social sign-in failed; the API's OAuth callback adds it on the way back. */
  error?: string
  /** A social sign-in needs the artist's 2FA code; the pending token is in a cookie. */
  twoFactor?: boolean
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    next: typeof search.next === 'string' ? search.next : undefined,
    addAccount:
      search.addAccount === true ||
      search.addAccount === 1 ||
      search.addAccount === '1'
        ? true
        : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
    twoFactor:
      search.twoFactor === true ||
      search.twoFactor === 1 ||
      search.twoFactor === '1'
        ? true
        : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  return <LoginView />
}
