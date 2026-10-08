import { createFileRoute } from '@tanstack/react-router'
import { LoginView } from '@views/LoginView'

interface LoginSearch {
  next?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  return <LoginView />
}
