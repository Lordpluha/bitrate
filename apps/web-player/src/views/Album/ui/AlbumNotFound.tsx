'use client'

import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import { CollectionPanel } from '@shared/ui/CollectionHeader'
import { Disc3 } from 'lucide-react'

/** The design's album not-found frame: a missing or removed album. */
export const AlbumNotFound = () => {
  const { t } = useI18n()

  return (
    <CollectionPanel>
      <StateMessage
        description={t('album.notFoundDescription')}
        icon={Disc3}
        primary={{ href: ROUTES.main, label: t('common.backToHome') }}
        title={t('album.notFound')}
      />
    </CollectionPanel>
  )
}
