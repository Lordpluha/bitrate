'use client'

import { useI18n } from '@shared/i18n'
import { ErrorState } from '@shared/ui'
import { CollectionPanel } from '@shared/ui/CollectionHeader'

/** The design's album error frame, instead of the generic page error. */
export default function AlbumError({ reset }: { reset: () => void }) {
  const { t } = useI18n()

  return (
    <CollectionPanel>
      <ErrorState
        description={t('error.tryAgainShort')}
        onRetry={reset}
        title={t('album.loadFailed')}
      />
    </CollectionPanel>
  )
}
