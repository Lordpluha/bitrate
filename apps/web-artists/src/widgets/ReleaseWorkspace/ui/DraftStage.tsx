import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  releaseCoverUrl,
  releaseRoadmap,
  releaseTypeLabels,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDuration } from '@shared/lib/format'
import { LockedButton } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import {
  CircleCheck,
  CircleDashed,
  ImagePlus,
  Info,
  Music2,
  Play,
} from 'lucide-react'
import { editLockReason } from '../lib/locks'
import type { WorkspaceActionHandler } from '../model/workspaceAction'
import { WorkspaceCredits } from './WorkspaceCredits'
import { WorkspaceReadiness } from './WorkspaceReadiness'
import { WorkspaceRights } from './WorkspaceRights'
import { WorkspaceTracks } from './WorkspaceTracks'

type PreparationKey =
  | 'details'
  | 'timing'
  | 'artwork'
  | 'audio'
  | 'credits'
  | 'rights'

const PREPARATION = new Set<string>([
  'details',
  'timing',
  'artwork',
  'audio',
  'credits',
  'rights',
])

function duration(value: number | null) {
  return value === null ? '—' : formatDuration(value)
}

interface DraftStageProps {
  artistId: string
  release: ReleaseWorkspace
  /** Every button that opens a dialog reports here. */
  onAction: WorkspaceActionHandler
}

/** Stage 1: everything the artist prepares before asking Bitrate to review. */
export function DraftStage({ artistId, release, onAction }: DraftStageProps) {
  const lock = editLockReason(release.status)
  const { t, tp } = useI18n()
  const steps = releaseRoadmap(release).filter((step) =>
    PREPARATION.has(step.key),
  )
  const left = steps.filter((step) => step.state !== 'done').length
  const master = release.trackDrafts[0]
  const actions: Record<
    PreparationKey,
    { label: string; run: () => void } | { label: string; href: string }
  > = {
    details: {
      label: t('workspace.draft.editDetails'),
      run: () => onAction({ kind: 'edit' }),
    },
    timing: {
      label: t('workspace.draft.editTiming'),
      run: () => onAction({ kind: 'schedule' }),
    },
    artwork: {
      label: release.cover
        ? t('workspace.draft.editArtwork')
        : t('workspace.draft.addArtwork'),
      run: () => onAction({ kind: 'cover' }),
    },
    audio:
      release.trackCount === 0
        ? {
            label: t('workspace.draft.addAudio'),
            run: () => onAction({ kind: 'track-add' }),
          }
        : {
            label: t('workspace.draft.editTracks'),
            href: '#release-tracks-heading',
          },
    credits: {
      label: t('workspace.draft.reviewCredits'),
      href: '#release-credits-heading',
    },
    rights: {
      label: t('workspace.draft.confirmRights'),
      run: () => onAction({ kind: 'rights' }),
    },
  }

  return (
    <>
      <div className="artist-release-stage">
        <section
          aria-labelledby="release-checklist-heading"
          className="artist-release-workspace-panel artist-release-stage-main"
        >
          <div className="artist-release-proof">
            <img
              alt=""
              aria-hidden="true"
              className="artist-release-proof-art"
              src="/artwork/releases/artwork-proofing-v1.webp"
            />
            {lock ? (
              release.cover ? (
                <img
                  alt={t('workspace.artworkAlt', { title: release.title })}
                  className="artist-release-proof-cover"
                  src={releaseCoverUrl(release.cover)}
                />
              ) : (
                <div className="artist-release-proof-cover artist-release-cover-placeholder">
                  <Music2 aria-hidden="true" />
                </div>
              )
            ) : (
              <button
                className="artist-release-proof-cover artist-release-proof-upload"
                data-empty={!release.cover}
                onClick={() => onAction({ kind: 'cover' })}
                type="button"
              >
                {release.cover && (
                  <img alt="" src={releaseCoverUrl(release.cover)} />
                )}
                <span className="artist-release-proof-upload-hint">
                  <ImagePlus aria-hidden="true" />
                  {release.cover
                    ? t('workspace.draft.changeArtwork')
                    : t('workspace.draft.addArtwork')}
                </span>
              </button>
            )}
            <div className="artist-release-proof-identity">
              <p className="artist-release-proof-title">{release.title}</p>
              <p>{release.artistName}</p>
              <p className="artist-release-proof-meta">
                <span className="artist-release-chip">
                  {t(releaseTypeLabels[release.type])}
                </span>
                {tp({ count: release.trackCount, key: 'common.tracks' })}
              </p>
              <p
                className="artist-release-proof-state"
                data-complete={left === 0}
              >
                {left === 0 ? (
                  <CircleCheck aria-hidden="true" />
                ) : (
                  <CircleDashed aria-hidden="true" />
                )}
                {left === 0
                  ? t('workspace.draft.complete')
                  : tp({ count: left, key: 'workspace.draft.stepsLeft' })}
              </p>
            </div>
            <div className="artist-release-proof-master">
              {master ? (
                <>
                  <p className="artist-release-proof-track">
                    <Play aria-hidden="true" />
                    <span className="min-w-0 truncate">{master.title}</span>
                    <span className="artist-release-chip">
                      {t('workspace.draft.master')}
                    </span>
                  </p>
                  <p>
                    <span>{t('workspace.draft.duration')}</span>
                    <span>{duration(master.duration)}</span>
                  </p>
                </>
              ) : (
                <p>{t('workspace.draft.noMaster')}</p>
              )}
            </div>
          </div>
          <h2 id="release-checklist-heading">
            {t('workspace.draft.checklist')}
          </h2>
          <p>{t('workspace.draft.checklistHint')}</p>
          <ul className="artist-release-checklist">
            {steps.map((step) => {
              const action = actions[step.key as PreparationKey]
              const done = step.state === 'done'
              // The timing alone stays editable after approval.
              const rowLock =
                step.key === 'timing' && release.status === 'READY'
                  ? null
                  : lock
              return (
                <li data-done={done} key={step.key}>
                  {done ? (
                    <CircleCheck aria-hidden="true" />
                  ) : (
                    <CircleDashed aria-hidden="true" />
                  )}
                  <span className="artist-release-checklist-name">
                    {step.label}
                  </span>
                  <span className="artist-release-checklist-detail">
                    {step.detail}
                    <span>
                      {done ? t('workspace.ready') : t('workspace.needed')}
                    </span>
                  </span>
                  {rowLock ? (
                    <LockedButton reason={t(rowLock)} size="sm" variant="link">
                      {action.label}
                    </LockedButton>
                  ) : 'href' in action ? (
                    <Button asChild size="sm" variant="link">
                      <a href={action.href}>{action.label}</a>
                    </Button>
                  ) : (
                    <Button onClick={action.run} size="sm" variant="link">
                      {action.label}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="artist-release-honest">
            <Info aria-hidden="true" />
            {t('workspace.draft.honest')}
          </p>
        </section>
        {release.status === 'DRAFT' ? (
          <WorkspaceReadiness artistId={artistId} release={release} />
        ) : (
          <section
            aria-labelledby="release-submit-heading"
            className="artist-release-workspace-panel artist-release-stage-side"
            data-tone="success"
          >
            <h2 id="release-submit-heading">
              {t('workspace.draft.submitted')}
            </h2>
            <p>
              {t('workspace.draft.locked')}
              {release.status === 'REJECTED' &&
                ` ${t('workspace.draft.lockedRejected')}`}
            </p>
            <Button
              asChild
              className="artist-workspace-primary mt-4 w-full rounded-full"
              variant="primary"
            >
              <Link
                params={{ releaseId: release.id }}
                search={{ step: 'review' }}
                to="/dashboard/music/$releaseId"
              >
                {t('workspace.draft.openReview')}
              </Link>
            </Button>
          </section>
        )}
      </div>
      <div className="artist-release-editors">
        <WorkspaceTracks
          artistId={artistId}
          onAction={onAction}
          release={release}
        />
        <WorkspaceCredits onAction={onAction} release={release} />
        <WorkspaceRights onAction={onAction} release={release} />
      </div>
    </>
  )
}
