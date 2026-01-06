import { ROUTES } from '@shared/routes'
import Link from 'next/link'

export const AuthButtons = () => (
  <div className="flex items-center gap-4">
    <Link
      className="login text-xl py-2 px-6 rounded-3xl bg-green-500 hover:opacity-70 transition-[1s] text-primary font-medium"
      href={ROUTES.auth.login}
    >
      Login
    </Link>
    <Link
      className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-text font-medium border-solid border-2"
      href={ROUTES.auth.registration}
    >
      Register
    </Link>
  </div>
)
