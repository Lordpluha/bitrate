'use client'

import { InstallIcon } from '@bitrate/ui-react'
import { useInstallPrompt } from '@shared/hooks'

/** Opens the browser's install prompt; hidden where the browser offers none. */
export const InstallBtn = () => {
  const { canInstall, install } = useInstallPrompt()
  if (!canInstall) return null

  return (
    <button
      className="flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-white/10"
      onClick={() => void install()}
      type="button"
    >
      <InstallIcon />
      <span className="text-sm">Install App</span>
    </button>
  )
}
