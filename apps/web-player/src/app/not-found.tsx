import { ROUTES } from '@shared/routes'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-text">
      <p className="text-7xl font-black sm:text-9xl">404</p>
      <h1 className="text-2xl font-bold sm:text-3xl">Page not found</h1>
      <p className="max-w-110 text-text-subdued">
        We couldn&apos;t find the page you were looking for.
      </p>
      <Link
        className="mt-2 rounded-full bg-text px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-105"
        href={ROUTES.main}
      >
        Back to home
      </Link>
    </div>
  )
}
