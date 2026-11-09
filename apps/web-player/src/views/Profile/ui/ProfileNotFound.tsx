'use client'

import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import { UserRound } from 'lucide-react'

/** The design's public-profile not-found frame: a missing or deleted user. */
export const ProfileNotFound = () => {
  const { t } = useI18n()

  return (
    <div className="flex h-full flex-col px-4 md:px-8">
      <StateMessage
        description={t('profile.notFoundDescription')}
        icon={UserRound}
        primary={{ href: ROUTES.main, label: t('common.backToHome') }}
        title={t('profile.notFound')}
      />
    </div>
  )
}
