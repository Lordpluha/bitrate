'use client'

import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import { SearchX } from 'lucide-react'

/** An unknown player URL: the not-found frame inside the player shell, not the global 404. */
export default function MainNotFound() {
  const { t } = useI18n()

  return (
    <div className="flex h-full flex-col px-4 md:px-8">
      <StateMessage
        description={t('main.pageNotFoundDescription')}
        icon={SearchX}
        primary={{ href: ROUTES.main, label: t('common.backToHome') }}
        title={t('main.pageNotFound')}
      />
    </div>
  )
}
