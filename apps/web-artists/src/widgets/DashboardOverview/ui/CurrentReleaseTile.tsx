import { Button } from '@bitrate/ui-react'
import type { ArtistDashboard } from '@entities/dashboard'
import {
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
  StageRing,
} from '@entities/release'
import { TrackPlayer } from '@features/now-playing'
import { useI18n } from '@shared/i18n'
import { Countdown, PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Disc3, Music2 } from 'lucide-react'
import { nextStep } from '../lib/nextStep'

/** The release the artist works on now: artwork, its lead track, stage and next action. */
export function CurrentReleaseTile({
  release,
}: {
  release: ArtistDashboard['currentRelease']
}) {
  const i18n = useI18n()
  const { t, locale } = i18n
  if (!release)
    return (
      <section
        aria-labelledby="dashboard-current-heading"
        className="artist-release-workspace-panel"
      >
        <h2 id="dashboard-current-heading">
          <PanelIcon icon={Disc3} />
          {t('dashboard.current')}
        </h2>
        <p className="mt-3">{t('dashboard.noCurrent')}</p>
      </section>
    )
  const step = nextStep(release, i18n)
  const premiere =
    release.scheduledAt && Date.parse(release.scheduledAt) > Date.now()
      ? release.scheduledAt
      : null
  return (
    <section
      aria-labelledby="dashboard-current-heading"
      className="artist-release-workspace-panel artist-dash-current"
    >
      <h2 className="sr-only" id="dashboard-current-heading">
        {t('dashboard.current')}
      </h2>
      <div className="artist-dash-current-release">
        {release.cover ? (
          <img
            alt={t('workspace.artworkAlt', { title: release.title })}
            className="artist-dash-current-cover"
            src={releaseCoverUrl(release.cover)}
          />
        ) : (
          <div className="artist-dash-current-cover artist-release-cover-placeholder">
            <Music2 aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="artist-dash-current-title">{release.title}</p>
            <span className="artist-release-chip" data-status={release.status}>
              {t(releaseStatusLabels[release.status])}
            </span>
          </div>
          <p>
            {t(releaseTypeLabels[release.type])}
            {release.scheduledAt
              ? ` · ${t('dashboard.planned', {
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: 'medium',
                    timeZone: 'UTC',
                  }).format(new Date(release.scheduledAt)),
                })}`
              : ` · ${t('dashboard.noPlannedDate')}`}
          </p>
          {release.leadTrack ? (
            <TrackPlayer
              className="mt-3"
              coverUrl={release.cover && releaseCoverUrl(release.cover)}
              duration={release.leadTrack.duration}
              releaseId={release.id}
              title={release.leadTrack.title}
              trackId={release.leadTrack.id}
              waveform={release.leadTrack.waveform}
            />
          ) : (
            <p className="artist-dash-current-empty">
              {t('dashboard.uploadMaster')}
            </p>
          )}
        </div>
      </div>
      <div className="artist-dash-current-next">
        <StageRing
          className="artist-dash-current-ring"
          status={release.status}
        />
        <div className="grid min-w-0 gap-2">
          <h3>{step.title}</h3>
          <p>{step.detail}</p>
          {premiere && <Countdown className="mt-1" to={premiere} />}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button
              asChild
              className="artist-workspace-primary rounded-full"
              variant="primary"
            >
              <Link
                params={{ releaseId: release.id }}
                to="/dashboard/music/$releaseId"
              >
                <ArrowRight aria-hidden="true" className="size-4" />
                {step.label}
              </Link>
            </Button>
            <p>
              {release.status === 'RELEASED'
                ? t('dashboard.published')
                : t('dashboard.draftSaved')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
