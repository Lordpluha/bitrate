import { Button } from '@bitrate/ui-react'
import { useDistribution } from '@entities/delivery'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PageSkeleton, Pagination, PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { CircleCheck, CircleDashed, Send, Unplug } from 'lucide-react'
import { DeliveryMatrix } from './DeliveryMatrix'

interface DistributionViewProps {
  artistId: string
  page: number
}

/** Plans and store states of every release; never shows a release as delivered unless it was. */
export function DistributionView({ artistId, page }: DistributionViewProps) {
  const distribution = useDistribution(artistId, page)
  const { tMessage, t } = useI18n()
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
        <div className="artist-release-workspace-panel artist-dist-notice">
          <div className="artist-dist-notice-copy">
            <h2>
              <PanelIcon icon={Unplug} />
              {t('delivery.page.noPartnerTitle')}
            </h2>
            <p className="artist-dist-notice-text">
              {t('delivery.page.noPartner')}
            </p>
          </div>
          <ol aria-hidden="true" className="artist-dist-flow">
            <li data-reached="true">
              <CircleCheck />
              {t('delivery.page.flow.plan')}
            </li>
            <li>
              <CircleDashed />
              {t('delivery.page.flow.partner')}
            </li>
            <li>
              <CircleDashed />
              {t('delivery.page.flow.stores')}
            </li>
          </ol>
        </div>
      )}
      {distribution.isPending || distribution.isPlaceholderData ? (
        <PageSkeleton label={t('delivery.page.loading')} variant="table" />
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
        <div className="artist-release-workspace-panel artist-dist-empty">
          <Send aria-hidden="true" />
          <p>{t('delivery.page.empty')}</p>
          <Link
            className="artist-dash-link"
            search={{ tab: 'releases', page: 1 }}
            to={ROUTES.dashboard.music}
          >
            {t('delivery.page.openMusic')}
          </Link>
        </div>
      ) : (
        <DeliveryMatrix releases={distribution.data.data} />
      )}
      {distribution.data && pages > 1 && (
        <Pagination
          label={t('delivery.page.pages')}
          page={page}
          pages={pages}
          renderLink={(target, content) => (
            <Link search={{ page: target }} to={ROUTES.dashboard.distribution}>
              {content}
            </Link>
          )}
        />
      )}
    </section>
  )
}
