import { LoginView } from '@views/LoginView'
import { Suspense } from 'react'

export default function LoginPage() {
  /* LoginView reads the URL with useSearchParams: the boundary keeps the rest of the page prerendered */
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  )
}
