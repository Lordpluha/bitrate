import { Button } from '@bitrate/ui-react'
import { useArtistDashboard } from '@entities/dashboard'
import { CreateReleaseButton } from '@features/workspace-actions'
import { Interpolate, useI18n } from '@shared/i18n'
import { DashboardOverview } from '@widgets/DashboardOverview'
import { Upload } from 'lucide-react'

interface DashboardViewProps {
  artistId: string
}

/** First run until a release exists, then the returning-artist overview. */
export function DashboardView({ artistId }: DashboardViewProps) {
  const { t, tMessage } = useI18n()
  const dashboard = useArtistDashboard(artistId)
  return (
    <div className="artist-workspace-dashboard flex flex-col">
      <div>
        <h1 className="text-[1.75rem] font-normal leading-[1.5] lg:text-[2rem]">
          {t('shell.nav.dashboard')}
        </h1>
        <p className="mt-2 text-sm leading-[1.5] text-text-secondary lg:text-[0.9375rem]">
          {t('dashboard.subtitle')}
        </p>
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
      ) : dashboard.data.counts.releases === 0 ? (
        <FirstReleasePrompt />
      ) : (
        <DashboardOverview artistId={artistId} dashboard={dashboard.data} />
      )}
    </div>
  )
}

function FirstReleasePrompt() {
  const { t } = useI18n()
  return (
    <>
      <CreateReleaseButton className="mt-7 w-full lg:hidden" />
      <section
        aria-label={t('dashboard.first.label')}
        className="artist-workspace-first-release mt-8 rounded-xl border border-border px-6 lg:mt-12 lg:px-8"
      >
        <Upload
          aria-hidden="true"
          className="artist-workspace-upload size-6 lg:size-10"
        />
        <h2 className="artist-workspace-empty-title text-2xl font-normal lg:text-[1.625rem]">
          <span className="lg:hidden">
            {t('dashboard.first.line1')}
            <br />
            {t('dashboard.first.line2')}
          </span>
          <span className="hidden lg:inline">{t('dashboard.first.title')}</span>
        </h2>
        <p className="artist-workspace-empty-description text-sm text-text-secondary lg:text-[0.9375rem]">
          <Interpolate
            message={t('dashboard.first.description')}
            values={{ br: <br className="hidden lg:block" /> }}
          />
        </p>
        <CreateReleaseButton
          className="artist-workspace-empty-action hidden w-full max-w-84 lg:inline-flex"
          first
        />
        <p className="artist-workspace-empty-reassurance hidden text-xs text-text-secondary lg:block">
          {t('dashboard.first.reassurance')}
        </p>
      </section>
    </>
  )
}
