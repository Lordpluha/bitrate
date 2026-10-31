import { Button, cn } from '@bitrate/ui-react'
import { type ReleaseWorkspace, releaseRoadmap } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { useLocation } from '@tanstack/react-router'
import { ChevronDown, CircleCheck, CircleDashed, Lock } from 'lucide-react'
import { useId, useState } from 'react'
import { editLockReason } from '../lib/locks'
import type { WorkspaceActionHandler } from '../model/workspaceAction'
import { WorkspaceCredits } from './WorkspaceCredits'
import { WorkspaceReadiness } from './WorkspaceReadiness'
import { WorkspaceRights } from './WorkspaceRights'
import { WorkspaceTiming } from './WorkspaceTiming'
import { WorkspaceTracks } from './WorkspaceTracks'

type PreparationKey =
  | 'details'
  | 'timing'
  | 'artwork'
  | 'audio'
  | 'credits'
  | 'rights'

/** Links into the progress card; arriving through one opens it on phones. */
const CARD_HASHES = new Set([
  'release-checklist-heading',
  'release-submit-heading',
])

const PREPARATION = new Set<string>([
  'details',
  'timing',
  'artwork',
  'audio',
  'credits',
  'rights',
])

interface DraftStageProps {
  artistId: string
  release: ReleaseWorkspace
  /** Every button that opens a dialog reports here. */
  onAction: WorkspaceActionHandler
}

/**
 * Stage 1: everything the artist prepares before asking Bitrate to review. The side card is
 * the one place that says what is left and submits; the main column holds the editors.
 */
export function DraftStage({ artistId, release, onAction }: DraftStageProps) {
  const lock = editLockReason(release.status)
  const i18n = useI18n()
  const { t } = i18n
  const steps = releaseRoadmap(release, i18n).filter((step) =>
    PREPARATION.has(step.key),
  )
  const done = steps.filter((step) => step.state === 'done').length
  const draft = release.status === 'DRAFT'
  const bodyId = useId()
  const hash = useLocation({ select: (location) => location.hash })
  // Phones fold the checklist so the editors are one short scroll away; lg always shows it.
  const [toggled, setToggled] = useState<boolean | null>(null)
  const expanded = toggled ?? CARD_HASHES.has(hash)
  const progress = t('workspace.draft.progress', { done, total: steps.length })
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
    <div className="artist-release-stage artist-release-draft">
      <section
        aria-labelledby="release-checklist-heading"
        className="artist-release-workspace-panel artist-release-stage-side artist-release-progress"
        data-tone={draft && done === steps.length ? 'success' : undefined}
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="release-checklist-heading">
            {draft
              ? t('workspace.draft.checklist')
              : t('workspace.draft.submitted')}
          </h2>
          <span
            className="artist-release-progress-count max-lg:hidden"
            data-complete={done === steps.length}
          >
            {progress}
          </span>
          <button
            aria-controls={bodyId}
            aria-expanded={expanded}
            className="artist-release-progress-count artist-release-progress-toggle inline-flex items-center gap-1 lg:hidden"
            data-complete={done === steps.length}
            onClick={() => setToggled(!expanded)}
            type="button"
          >
            {progress}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'size-4 transition-transform motion-reduce:transition-none',
                expanded && 'rotate-180',
              )}
            />
          </button>
        </div>
        {lock ? (
          <p className="artist-release-progress-lock">
            <Lock aria-hidden="true" />
            {t(lock)}
          </p>
        ) : null}
        <div
          className="artist-release-progress-body"
          data-expanded={expanded}
          id={bodyId}
        >
          {!lock && <p>{t('workspace.draft.checklistHint')}</p>}
          <ul className="artist-release-checklist">
            {steps.map((step) => {
              const action = actions[step.key as PreparationKey]
              const complete = step.state === 'done'
              // The timing alone stays editable after approval.
              const editable =
                !lock || (step.key === 'timing' && release.status === 'READY')
              return (
                <li data-done={complete} key={step.key}>
                  {complete ? (
                    <CircleCheck aria-hidden="true" />
                  ) : (
                    <CircleDashed aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="artist-release-checklist-name">
                      {step.label}
                      <span className="sr-only">
                        {' '}
                        {complete
                          ? t('workspace.ready')
                          : t('workspace.needed')}
                      </span>
                    </span>
                    <span className="artist-release-checklist-detail">
                      {step.detail}
                    </span>
                  </span>
                  {editable &&
                    ('href' in action ? (
                      <Button asChild size="sm" variant="ghost">
                        <a href={action.href}>{action.label}</a>
                      </Button>
                    ) : (
                      <Button onClick={action.run} size="sm" variant="ghost">
                        {action.label}
                      </Button>
                    ))}
                </li>
              )
            })}
          </ul>
          {draft && (
            <WorkspaceReadiness
              artistId={artistId}
              onReview={() => onAction({ kind: 'submit' })}
              release={release}
            />
          )}
        </div>
      </section>
      <div className="artist-release-stage-main artist-release-editors">
        <WorkspaceTiming onAction={onAction} release={release} />
        <WorkspaceTracks
          artistId={artistId}
          onAction={onAction}
          release={release}
        />
        <WorkspaceCredits onAction={onAction} release={release} />
        <WorkspaceRights onAction={onAction} release={release} />
      </div>
    </div>
  )
}
