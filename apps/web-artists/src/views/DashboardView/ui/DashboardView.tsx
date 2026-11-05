import { Button } from '@bitrate/ui-react'
import { useArtistDashboard } from '@entities/dashboard'
import { CreateReleaseButton } from '@features/workspace-actions'
import {
  CustomizeControls,
  useCustomizableLayout,
} from '@features/workspace-layout'
import { Interpolate, useI18n } from '@shared/i18n'
import { DashboardOverview, dashboardTiles } from '@widgets/DashboardOverview'
import { Upload } from 'lucide-react'

interface DashboardViewProps {
  artistId: string
}

/** First run until a release exists, then the returning-artist overview. */
export function DashboardView({ artistId }: DashboardViewProps) {
  const { t, tMessage } = useI18n()
  const dashboard = useArtistDashboard(artistId)
  const layout = useCustomizableLayout(artistId, 'dashboard', dashboardTiles)
  const overview =
    dashboard.isSuccess && dashboard.data.counts.releases > 0
      ? dashboard.data
      : null
  return (
    <div className="artist-workspace-dashboard flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-normal leading-[1.5] lg:text-[2rem]">
            {t('shell.nav.dashboard')}
          </h1>
          <p className="mt-2 text-sm leading-[1.5] text-text-secondary lg:text-[0.9375rem]">
            {t('dashboard.subtitle')}
          </p>
        </div>
        {overview && <CustomizeControls layout={layout} />}
      </div>
      {dashboard.isPending ? (
        <p className="mt-8" role="status">
          {t('dashboard.loading')}
        </p>
      ) : dashboard.isError ? (
        <div className="mt-8 space-y-3">
          <p role="alert">{tMessage(dashboard.error.message)}</p>
          <Button
            onClick={() => {
              void dashboard.refetch()
            }}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : overview ? (
        <DashboardOverview
          artistId={artistId}
          dashboard={overview}
          layout={layout}
        />
      ) : (
        <FirstReleasePrompt />
      )}
    </div>
  )
}

/** A new artist's dashboard: a moving poster with one way forward. */
function FirstReleasePrompt() {
  const { t } = useI18n()
  const lines = [t('dashboard.poster.first'), t('dashboard.poster.upload')]
  return (
    <section
      aria-label={t('dashboard.first.label')}
      className="artist-workspace-first-release artist-poster mt-8 rounded-xl border border-border lg:mt-12"
    >
      <div aria-hidden="true" className="artist-poster-marquee">
        {lines.map((line, row) => (
          <div data-row={row} key={line}>
            <span>{`${line} · ${line} · ${line} · `}</span>
            <span>{`${line} · ${line} · ${line} · `}</span>
          </div>
        ))}
      </div>
      <div className="artist-poster-body px-6 lg:px-8">
        <Upload
          aria-hidden="true"
          className="artist-workspace-upload size-6 lg:size-10"
        />
        <h2 className="artist-workspace-empty-title text-2xl font-normal lg:text-[1.625rem]">
          {t('dashboard.first.title')}
        </h2>
        <p className="artist-workspace-empty-description text-sm text-text-secondary lg:text-[0.9375rem]">
          <Interpolate
            message={t('dashboard.first.description')}
            values={{ br: <br className="hidden lg:block" /> }}
          />
        </p>
        <CreateReleaseButton
          className="artist-workspace-empty-action w-full max-w-84"
          first
        />
        <p className="artist-workspace-empty-reassurance text-xs text-text-secondary">
          {t('dashboard.first.reassurance')}
        </p>
      </div>
    </section>
  )
}
