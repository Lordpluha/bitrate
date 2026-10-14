'use client'

import { InstallIcon } from '@bitrate/ui-react'
import { useInstallPrompt } from '@shared/hooks'

/** Opens the browser's install prompt; hidden where the browser offers none. */
export const InstallBtn = () => {
  const { canInstall, install } = useInstallPrompt()
  if (!canInstall) return null

  return (
    <button
      className="flex items-center space-x-2 hover:opacity-70 transition-[.3s]"
      onClick={() => void install()}
      type="button"
    >
      <InstallIcon />
      <span className="text-sm">Install App</span>
    </button>
  )
}
