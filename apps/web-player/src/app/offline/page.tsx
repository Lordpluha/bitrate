import { WifiOff } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6 text-center text-text">
      <div className="max-w-md">
        <WifiOff className="mx-auto mb-5 text-text-subdued" size={48} />
        <h1 className="text-3xl font-bold">You are offline</h1>
        <p className="mt-3 text-text-subdued">
          Check your connection and try opening the page again.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-black transition-colors hover:bg-primary-hover"
          href={ROUTES.main}
        >
          Try again
        </Link>
      </div>
    </main>
  )
}
