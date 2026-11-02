import { Button } from '@bitrate/ui-react'
import { territorySummary, useDistribution } from '@entities/delivery'
import { releaseCoverUrl, releaseStatusLabels } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { DestinationStates } from '@widgets/ReleaseDelivery'
import { Info, Music2, Send } from 'lucide-react'

interface DistributionViewProps {
  artistId: string
  page: number
}

/** Plans and store states of every release; never shows a release as delivered unless it was. */
export function DistributionView({ artistId, page }: DistributionViewProps) {
  const distribution = useDistribution(artistId, page)
  const i18n = useI18n()
  const { tMessage, t } = i18n
  const connected = distribution.data?.data[0]?.partner.connected
  const pages = distribution.data
    ? Math.max(1, Math.ceil(distribution.data.total / distribution.data.limit))
    : 1

  return (
    <section
      aria-busy={distribution.isFetching}
      className="artist-music space-y-6"
    >
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
          {t('shell.nav.distribution')}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          {t('delivery.page.subtitle')}
        </p>
      </div>
      {connected === false && (
        <div className="artist-release-inset rounded-lg border border-border p-4">
          <Info aria-hidden="true" className="size-5 shrink-0 text-accent" />
          <p className="text-sm">{t('delivery.page.noPartner')}</p>
        </div>
      )}
      {distribution.isPending ? (
        <p role="status">{t('delivery.page.loading')}</p>
      ) : distribution.isError ? (
        <div className="space-y-3">
          <p role="alert">{tMessage(distribution.error.message)}</p>
          <Button
            onClick={() => {
              void distribution.refetch()
            }}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : distribution.data.data.length === 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-border p-5">
          <Send aria-hidden="true" className="size-5 shrink-0 text-accent" />
          <div className="space-y-2">
            <p>{t('delivery.page.empty')}</p>
            <Link
              className="underline"
              search={{ tab: 'releases', page: 1 }}
              to={ROUTES.dashboard.music}
            >
              {t('delivery.page.openMusic')}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {distribution.data.data.map((delivery) => (
            <li
              className="artist-release-workspace-panel space-y-4"
              key={delivery.releaseId}
            >
              <div className="flex flex-wrap items-center gap-4">
                {delivery.cover ? (
                  <img
                    alt=""
                    className="size-14 shrink-0 rounded-md border border-border object-cover"
                    src={releaseCoverUrl(delivery.cover)}
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-dashed border-border">
                    <Music2 aria-hidden="true" className="size-6 text-accent" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2>
                    <Link
                      className="underline"
                      params={{ releaseId: delivery.releaseId }}
                      to="/dashboard/music/$releaseId"
                    >
                      {delivery.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {t(releaseStatusLabels[delivery.status])} ·{' '}
                    {territorySummary(delivery, i18n)} ·{' '}
                    {delivery.sent
                      ? t('delivery.page.sent')
                      : t('delivery.availability.notSent')}
                  </p>
                </div>
              </div>
              <DestinationStates delivery={delivery} plannedOnly />
            </li>
          ))}
        </ul>
      )}
      {distribution.data && pages > 1 && (
        <nav
          aria-label={t('delivery.page.pages')}
          className="flex items-center justify-between gap-3"
        >
          {page > 1 ? (
            <Link
              className="underline"
              search={{ page: page - 1 }}
              to={ROUTES.dashboard.distribution}
            >
              {t('music.pagination.previous')}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-text-secondary">
            {t('common.pageOf', { page, total: pages })}
          </span>
          {page < pages ? (
            <Link
              className="underline"
              search={{ page: page + 1 }}
              to={ROUTES.dashboard.distribution}
            >
              {t('music.pagination.next')}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  )
}
