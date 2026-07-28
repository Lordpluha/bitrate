import { ROUTES } from '@shared/routes'
import { redirect } from 'next/navigation'

type LoginRedirectPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginRedirectPage({
  searchParams,
}: LoginRedirectPageProps) {
  const { error } = await searchParams
  redirect(error ? `${ROUTES.auth.login}?error=${error}` : ROUTES.auth.login)
}
