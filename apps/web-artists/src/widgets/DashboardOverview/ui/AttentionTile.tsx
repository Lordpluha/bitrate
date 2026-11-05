import type { ArtistDashboard } from '@entities/dashboard'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, CircleAlert } from 'lucide-react'
import { attentionCopy } from '../lib/attentionCopy'

/** What needs the artist before a release can move on. */
export function AttentionTile({
  items,
}: {
  items: ArtistDashboard['attention']
}) {
  const i18n = useI18n()
  const { t } = i18n
  return (
    <section
      aria-labelledby="dashboard-attention-heading"
      className="artist-release-workspace-panel artist-dash-attention"
      data-tone={items.length > 0 ? 'warning' : undefined}
    >
      <img
        alt=""
        aria-hidden="true"
        className="artist-dash-art"
        src="/artwork/dashboard/mastering-console.webp"
      />
      <div className="artist-dash-attention-head">
        <h2 id="dashboard-attention-heading">
          <PanelIcon icon={CircleAlert} />
          {t('dashboard.attention.title')}
        </h2>
        <span>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3">{t('dashboard.attention.clear')}</p>
      ) : (
        <ul className="artist-dash-attention-list">
          {items.map((item) => {
            const copy = attentionCopy(item, i18n)
            const content = (
              <>
                <span className="min-w-0">
                  <span className="artist-release-row-title">{copy.title}</span>
                  <span>{copy.detail}</span>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </>
            )
            return (
              <li key={`${item.kind}-${item.releaseId ?? 'catalogue'}`}>
                {item.releaseId ? (
                  <Link
                    params={{ releaseId: item.releaseId }}
                    search={{
                      step:
                        item.kind === 'CHANGES_REQUESTED' ? 'review' : 'draft',
                    }}
                    to="/dashboard/music/$releaseId"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
