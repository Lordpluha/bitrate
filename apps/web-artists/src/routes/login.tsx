import { createFileRoute } from '@tanstack/react-router'
import { LoginView } from '@views/LoginView'

interface LoginSearch {
  next?: string
  addAccount?: boolean
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
  }),
  component: LoginPage,
})

function LoginPage() {
  return <LoginView />
}
