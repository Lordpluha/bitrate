import { LoginView } from '@views/LoginView'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Log in',
}

export default function LoginPage() {
  /* LoginView reads the URL with useSearchParams: the boundary keeps the rest of the page prerendered */
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  )
}
