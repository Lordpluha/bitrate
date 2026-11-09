import { Button } from '@bitrate/ui-react'
import { trackStatusLabels, trackVersionLabels } from '@entities/music'
import {
  releaseStageLabels,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { Waveform } from '@features/now-playing/ui/Waveform'
import { useI18n } from '@shared/i18n'
import { tiltHandlers } from '@shared/lib/tilt'
import { ROUTES } from '@shared/routes/routes'
import { Countdown, PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CircleCheck,
  ImagePlus,
  ListChecks,
  ListMusic,
  Pencil,
  PencilLine,
  Play,
  ShieldCheck,
  Upload,
  UsersRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PREMIERE_AT, WAVEFORM_PEAKS } from '../lib/studioPreview'
import { type StudioDetail, StudioReleaseDetails } from './StudioReleaseDetails'

export function StudioWorkspacePreview() {
  const { t, tp } = useI18n()
  const [detail, setDetail] = useState<StudioDetail | null>(null)
  const detailTrigger = useRef<HTMLButtonElement | null>(null)
  const tracksRef = useRef<HTMLElement>(null)
  const openDetail = (kind: StudioDetail, trigger: HTMLButtonElement) => {
    detailTrigger.current = trigger
    setDetail(kind)
  }
  useEffect(() => {
    if (!detail) detailTrigger.current?.focus({ preventScroll: true })
  }, [detail])
  const checklistSteps = [
    {
      key: 'details',
      label: t('release.roadmap.details'),
      detail: t('release.roadmap.detailsDone'),
      actionLabel: t('workspace.draft.editDetails'),
    },
    {
      key: 'timing',
      label: t('release.roadmap.timing'),
      detail: t('release.roadmap.premiere', {
        date: 'Nov 14, 2026, 6:00 PM',
      }),
      actionLabel: t('workspace.draft.editTiming'),
    },
    {
      key: 'artwork',
      label: t('release.roadmap.artwork'),
      detail: t('release.roadmap.artworkDone'),
      actionLabel: t('workspace.draft.editArtwork'),
    },
    {
      key: 'audio',
      label: t('release.roadmap.audio'),
      detail: tp({ count: 1, key: 'release.roadmap.audioDone' }),
      actionLabel: t('workspace.draft.editTracks'),
    },
    {
      key: 'credits',
      label: t('release.roadmap.credits'),
      detail: t('release.roadmap.creditsDone'),
      actionLabel: t('workspace.draft.reviewCredits'),
    },
    {
      key: 'rights',
      label: t('release.roadmap.rights'),
      detail: t('release.roadmap.rightsDone'),
      actionLabel: t('workspace.draft.confirmRights'),
    },
  ] as const

  return (
    <div className="studio-preview-workspace-shell">
      {detail && (
        <StudioReleaseDetails kind={detail} onClose={() => setDetail(null)} />
      )}
      <div
        className="artist-release-workspace studio-preview-workspace"
        inert={detail !== null}
      >
        {/* 1:1 `ReleaseHeader` */}
        <div className="artist-release-header">
          <span aria-hidden="true" className="artist-cover-wash">
            <img alt="" src="/artwork/landing/night-signal.webp" />
          </span>
          <img
            alt=""
            aria-hidden="true"
            className="artist-release-header-art"
            src="/artwork/releases/release-header-a.webp"
          />
          <div className="artist-release-header-identity">
            <div className="artist-release-cover-stage" data-playing={false}>
              <span aria-hidden="true" className="artist-release-vinyl">
                <span
                  className="artist-release-vinyl-label"
                  style={{
                    backgroundImage: 'url(/artwork/landing/night-signal.webp)',
                  }}
                />
              </span>
              <div className="artist-tilt" {...tiltHandlers}>
                <button
                  aria-label={t('workspace.draft.editArtwork')}
                  className="artist-release-cover artist-release-cover-upload"
                  data-empty={false}
                  data-over={false}
                  onClick={(event) =>
                    openDetail('artwork', event.currentTarget)
                  }
                  type="button"
                >
                  <img alt="" src="/artwork/landing/night-signal.webp" />
                  <span
                    aria-hidden="true"
                    className="artist-release-cover-hint"
                  >
                    <ImagePlus />
                    {t('workspace.draft.editArtwork')}
                  </span>
                </button>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="min-w-0 text-[1.375rem] font-semibold leading-[1.3] text-foreground wrap-anywhere">
                  Night Signal
                </p>
                <Button
                  aria-label={t('workspace.title.edit')}
                  className="shrink-0"
                  onClick={(event) =>
                    openDetail('details', event.currentTarget)
                  }
                  size="icon"
                  variant="ghost"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                </Button>
              </div>
              <p>
                Mira Sol · {t(releaseTypeLabels.SINGLE)} ·{' '}
                {tp({ count: 1, key: 'common.tracks' })}
              </p>
              <div className="artist-release-header-meta">
                <span className="artist-release-chip" data-status="DRAFT">
                  <PencilLine aria-hidden="true" />
                  {t(releaseStatusLabels.DRAFT)}
                </span>
                <span>
                  {t('workspace.header.updated', {
                    date: 'Nov 6, 2026, 3:20 PM',
                  })}
                </span>
              </div>
              <Countdown
                className="artist-release-header-countdown"
                to={PREMIERE_AT}
              />
            </div>
          </div>

          <div className="artist-release-header-action">
            <div className="min-w-0">
              <p className="artist-release-eyebrow">
                {t('workspace.header.nextAction')}
              </p>
              <h2>{t('workspace.next.submit')}</h2>
              <p>{t('workspace.next.submitDescription')}</p>
            </div>
            <Button
              asChild
              className="artist-workspace-primary rounded-full"
              variant="primary"
            >
              <Link to={ROUTES.auth.registration}>
                {t('workspace.next.submitLabel')}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 1:1 `ReleaseStepper` (`Draft -> Bitrate review -> Store plan -> Release`) */}
        <div className="artist-release-stepper">
          <nav aria-label={t('workspace.stages')}>
            <ol>
              {[
                {
                  key: 'draft',
                  label: t(releaseStageLabels.draft),
                  state: 'current',
                },
                {
                  key: 'review',
                  label: t(releaseStageLabels.review),
                  state: 'upcoming',
                },
                {
                  key: 'deliver',
                  label: t(releaseStageLabels.deliver),
                  state: 'optional',
                },
                {
                  key: 'launch',
                  label: t(releaseStageLabels.launch),
                  state: 'upcoming',
                },
              ].map((stage, index, arr) => (
                <li data-state={stage.state} key={stage.key}>
                  <a
                    aria-current={
                      stage.state === 'current' ? 'page' : undefined
                    }
                    href="#landing-studio-stage"
                  >
                    <span
                      aria-hidden="true"
                      className="artist-release-step-dot"
                    >
                      {index + 1}
                    </span>
                    <span className="artist-release-step-name">
                      {stage.label}
                    </span>
                  </a>
                  {index < arr.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="artist-release-step-line"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* 1:1 `DraftStage` (`Preparation checklist` + `WorkspaceTiming` + `WorkspaceTracks` + `WorkspaceCredits` + `WorkspaceRights`) */}
        <div className="artist-release-stage artist-release-draft studio-preview-draft">
          <section
            aria-label={t('workspace.draft.checklist')}
            className="artist-release-workspace-panel artist-release-stage-side artist-release-progress"
            data-tone="success"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2>
                <PanelIcon icon={ListChecks} />
                {t('workspace.draft.checklist')}
              </h2>
              <span
                className="artist-release-progress-count"
                data-complete={true}
              >
                {t('workspace.draft.progress', { done: 6, total: 6 })}
              </span>
            </div>
            <div className="artist-release-progress-body" data-expanded={true}>
              <p>{t('workspace.draft.checklistHint')}</p>
              <ul className="artist-release-checklist">
                {checklistSteps.map((step) => (
                  <li data-done={true} key={step.key}>
                    <CircleCheck aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="artist-release-checklist-name">
                        {step.label}
                      </span>
                      <span className="artist-release-checklist-detail">
                        {step.detail}
                      </span>
                    </span>
                    <Button
                      onClick={(event) => {
                        if (step.key === 'audio') {
                          tracksRef.current?.focus({ preventScroll: true })
                          tracksRef.current?.scrollIntoView({
                            block: 'nearest',
                          })
                        } else {
                          openDetail(step.key, event.currentTarget)
                        }
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      {step.actionLabel}
                    </Button>
                  </li>
                ))}
              </ul>

              {/* 1:1 `WorkspaceReadiness` + `ReleaseSubmission` */}
              <div className="artist-release-submit">
                <div className="space-y-3">
                  <Button
                    asChild
                    className="artist-workspace-primary rounded-full"
                    variant="primary"
                  >
                    <Link to={ROUTES.auth.registration}>
                      {t('publish.review')}
                    </Link>
                  </Button>
                  <p className="text-sm text-text-secondary">
                    {t('publish.submitHint')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="artist-release-stage-main">
            <div className="artist-layout">
              <div className="artist-layout-grid" data-variant="halves">
                {/* 1:1 `WorkspaceTracks` with 1 single recording (`DraftTrackRow`) and visual-only `TrackPlayer` */}
                <div className="artist-layout-tile" data-size="L">
                  <section
                    aria-label={t('workspace.tracks.title')}
                    className="artist-release-workspace-panel artist-release-tracks"
                    ref={tracksRef}
                    tabIndex={-1}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2>
                        <PanelIcon icon={ListMusic} />
                        {t('workspace.tracks.title')} <span>(1)</span>
                      </h2>
                      <Button
                        asChild
                        className="gap-1.5"
                        size="sm"
                        variant="outline"
                      >
                        <Link to={ROUTES.auth.registration}>
                          <Upload aria-hidden="true" className="size-4" />
                          {t('music.uploadTrack')}
                        </Link>
                      </Button>
                    </div>
                    <p>{t('workspace.tracks.description')}</p>
                    <ul className="artist-release-track-list">
                      <li>
                        <div className="artist-release-track-head">
                          <span className="artist-release-track-index">1</span>
                          <div className="min-w-0 flex-1">
                            <h3>Night Signal</h3>
                            <p>
                              {t(trackVersionLabels.ORIGINAL)} · 3:56 · ISRC
                              US-BTR-26-00141
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="truncate">
                                night-signal-master-24bit.wav · 42.8 MB
                              </span>
                            </p>
                          </div>
                          <span
                            className="artist-release-chip artist-release-track-status"
                            data-status="READY"
                          >
                            {t(trackStatusLabels.READY)}
                          </span>
                        </div>

                        {/* 1:1 `TrackPlayer` (visual only, does not play sound) */}
                        <div
                          className="artist-track-player"
                          data-current={false}
                        >
                          <Button
                            aria-label={t('music.table.play', {
                              title: 'Night Signal',
                            })}
                            className="artist-track-player-toggle"
                            size="icon"
                            variant="primary"
                          >
                            <Play aria-hidden="true" className="size-4" />
                          </Button>
                          <Waveform
                            bars={120}
                            className="artist-track-player-wave"
                            currentTime={0}
                            duration={236}
                            label={t('music.player.seek', {
                              title: 'Night Signal',
                            })}
                            peaks={WAVEFORM_PEAKS}
                            progress={0}
                          />
                          <span className="artist-track-player-time">
                            0:00 / 3:56
                          </span>
                        </div>

                        <div className="studio-preview-detail-actions">
                          <Button
                            onClick={(event) =>
                              openDetail('credits', event.currentTarget)
                            }
                            size="sm"
                            variant="outline"
                          >
                            <UsersRound aria-hidden="true" className="size-4" />
                            {t('workspace.credits.title')}
                          </Button>
                          <Button
                            onClick={(event) =>
                              openDetail('rights', event.currentTarget)
                            }
                            size="sm"
                            variant="outline"
                          >
                            <ShieldCheck
                              aria-hidden="true"
                              className="size-4"
                            />
                            {t('workspace.rights.title')}
                          </Button>
                        </div>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
