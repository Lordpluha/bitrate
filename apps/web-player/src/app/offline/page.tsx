'use client'

import { Logo, StateMessage } from '@shared/ui'
import { WifiOff } from 'lucide-react'
import { ROUTES } from '@/shared/routes'

/** Shown by the service worker without a connection: the logo and the design's offline message. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-foreground">
      <Logo href={ROUTES.main} wordmark />
      <StateMessage
        className="min-h-0 flex-none"
        description="Check your connection and try opening the page again."
        icon={WifiOff}
        primary={{
          label: 'Try again',
          onClick: () => window.location.reload(),
        }}
        title="You are offline"
      />
    </main>
  )
}
