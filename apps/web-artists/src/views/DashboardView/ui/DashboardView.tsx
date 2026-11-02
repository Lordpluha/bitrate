import { Button } from '@bitrate/ui-react'
import { useArtistDashboard } from '@entities/dashboard'
import { CreateReleaseButton } from '@features/workspace-actions'
import { useI18n } from '@shared/i18n'
import { DashboardOverview } from '@widgets/DashboardOverview'
import { Upload } from 'lucide-react'

interface DashboardViewProps {
  artistId: string
}

/** First run until a release exists, then the returning-artist overview. */
export function DashboardView({ artistId }: DashboardViewProps) {
  const { tMessage } = useI18n()
  const dashboard = useArtistDashboard(artistId)
  return (
    <div className="artist-workspace-dashboard flex flex-col">
      <div>
        <h1 className="text-[1.75rem] font-normal leading-[1.5] lg:text-[2rem]">
          Dashboard
        </h1>
        <p className="mt-2 text-sm leading-[1.5] text-text-secondary lg:text-[0.9375rem]">
          Everything you need for your next release.
        </p>
      </div>
      {dashboard.isPending ? (
        <p className="mt-8" role="status">
          Loading your workspace…
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
            Try again
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
  return (
    <>
      <CreateReleaseButton className="mt-7 w-full lg:hidden" />
      <section
        aria-label="Release workspace"
        className="artist-workspace-first-release mt-8 rounded-xl border border-border px-6 lg:mt-12 lg:px-8"
      >
        <Upload
          aria-hidden="true"
          className="artist-workspace-upload size-6 lg:size-10"
        />
        <h2 className="artist-workspace-empty-title text-2xl font-normal lg:text-[1.625rem]">
          <span className="lg:hidden">
            Your first track.
            <br />
            Your next step.
          </span>
          <span className="hidden lg:inline">Start with a finished track</span>
        </h2>
        <p className="artist-workspace-empty-description text-sm text-text-secondary lg:text-[0.9375rem]">
          Upload your audio and artwork. We’ll help you prepare
          <br className="hidden lg:block" /> your release details and find the
          next step.
        </p>
        <CreateReleaseButton
          className="artist-workspace-empty-action hidden w-full max-w-84 lg:inline-flex"
          first
        />
        <p className="artist-workspace-empty-reassurance hidden text-xs text-text-secondary lg:block">
          You can finish your draft later.
        </p>
      </section>
    </>
  )
}
