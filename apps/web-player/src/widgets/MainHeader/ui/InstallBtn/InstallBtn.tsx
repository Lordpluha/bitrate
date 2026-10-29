'use client'

import { InstallIcon } from '@bitrate/ui-react'
import { useInstallPrompt } from '@shared/hooks'
import { useI18n } from '@shared/i18n'

/** Opens the browser's install prompt; hidden where the browser offers none. */
export const InstallBtn = () => {
  const { t } = useI18n()
  const { canInstall, install } = useInstallPrompt()
  if (!canInstall) return null

  return (
    <button
      className="flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-surface"
      onClick={() => void install()}
      type="button"
    >
      <InstallIcon />
      <span className="text-sm">{t('header.installApp')}</span>
    </button>
  )
}
