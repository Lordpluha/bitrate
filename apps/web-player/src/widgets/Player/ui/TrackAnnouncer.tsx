'use client'

import { useI18n } from '@/shared/i18n'

type TrackAnnouncerProps = {
  title: string
}

/** Tells screen readers which track is now playing whenever it changes. */
export const TrackAnnouncer = ({ title }: TrackAnnouncerProps) => {
  const { t } = useI18n()

  return (
    <p aria-live="polite" className="sr-only">
      {t('player.nowPlayingTitle', { title })}
    </p>
  )
}
