import { useI18n } from '@shared/i18n'
import { Music2 } from 'lucide-react'
import type { CSSProperties, RefObject } from 'react'
import type { ListeningPreview } from '../lib/listeningPreview'
import { ResponseNumber } from './ResponseNumber'

export function ListeningTracks({
  preview,
  entered,
  listRef,
}: {
  preview: ListeningPreview
  entered: boolean
  listRef: RefObject<HTMLOListElement | null>
}) {
  const { t, tp } = useI18n()
  return (
    <div className="artist-response-top artist-response-glass">
      <div className="artist-response-top-heading">
        <h3>
          <Music2 aria-hidden="true" />
          {t('analytics.top')}
        </h3>
        <span>{tp({ count: preview.period, key: 'analytics.days' })}</span>
      </div>
      <ol className="artist-response-track-list" ref={listRef}>
        {preview.tracks.map((track, index) => (
          <li
            className="artist-response-track"
            data-response-track={track.id}
            key={track.id}
            style={
              {
                '--response-rank': index,
                '--response-share': track.plays / preview.tracks[0].plays,
              } as CSSProperties
            }
          >
            <span className="artist-response-rank">0{index + 1}</span>
            <img alt="" height={36} src={track.cover} width={36} />
            <span className="artist-response-track-info">
              <span title={track.title}>{track.title}</span>
              <span aria-hidden="true" className="artist-response-track-bar">
                <span />
              </span>
            </span>
            <span className="artist-response-track-count">
              <ResponseNumber entered={entered} value={track.plays} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
