import { useI18n } from '@shared/i18n'
import { tiltHandlers } from '@shared/lib/tilt'
import { Headphones, Repeat2, UsersRound } from 'lucide-react'
import type { ListeningPreview } from '../lib/listeningPreview'
import { ResponseNumber } from './ResponseNumber'

export function ListeningSpotlight({
  preview,
  entered,
}: {
  preview: ListeningPreview
  entered: boolean
}) {
  const { t } = useI18n()
  const track = preview.tracks[0]
  return (
    <div className="artist-response-spotlight">
      <div className="artist-response-record-stage" {...tiltHandlers}>
        <figure className="artist-response-record" key={track.id}>
          <div className="artist-response-record-art">
            <span aria-hidden="true" className="artist-response-record-halo" />
            <span aria-hidden="true" className="artist-response-record-disc">
              <img
                alt=""
                className="artist-response-record-label"
                height={72}
                src={track.cover}
                width={72}
              />
            </span>
            <img alt={track.title} height={200} src={track.cover} width={200} />
            <span className="artist-response-record-badge">
              <Headphones aria-hidden="true" />
              <span className="artist-response-record-badge-label">
                {t('landing.response.leading')}
              </span>
              <span
                aria-hidden="true"
                className="artist-response-record-badge-rank"
              >
                #1
              </span>
            </span>
          </div>
          <figcaption>
            <h3>{track.title}</h3>
            <p>
              Mira Sol <span aria-hidden="true">·</span> Bitrate
            </p>
          </figcaption>
        </figure>
      </div>
      <dl className="artist-response-audience artist-response-glass">
        <div>
          <dt>
            <UsersRound aria-hidden="true" />
            {t('analytics.listeners')}
          </dt>
          <dd>
            <ResponseNumber entered={entered} value={preview.listeners} />
          </dd>
        </div>
        <div>
          <dt>
            <Repeat2 aria-hidden="true" />
            {t('landing.response.average')}
          </dt>
          <dd>
            <ResponseNumber
              decimals={1}
              entered={entered}
              value={preview.plays / preview.listeners}
            />
          </dd>
        </div>
      </dl>
    </div>
  )
}
