import { Button } from '@bitrate/ui-react'
import {
  type ReleaseStage,
  type ReleaseWorkspace,
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { type I18n, type Translate, useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Clock,
  ImagePlus,
  type LucideIcon,
  Music2,
  PencilLine,
} from 'lucide-react'
import { useState } from 'react'
import type {
  WorkspaceAction,
  WorkspaceActionHandler,
} from '../model/workspaceAction'

type Status = ReleaseWorkspace['status']

const statusIcons: Record<Status, LucideIcon> = {
  DRAFT: PencilLine,
  SUBMITTED: Clock,
  REJECTED: CircleAlert,
  READY: CircleCheck,
  SCHEDULED: Clock,
  PUBLISHING: Clock,
  PUBLISH_FAILED: CircleAlert,
  RELEASED: CircleCheck,
  UNPUBLISHED: CircleAlert,
}

interface NextAction {
  title: string
  description: string
  label: string
  stage: ReleaseStage
  /** Section of that stage to scroll to. */
  hash?: string
  /** Opens this dialog on the page instead of navigating. */
  dialog?: WorkspaceAction
}

function nextAction(
  release: ReleaseWorkspace,
  t: Translate,
  tp: I18n['tp'],
): NextAction {
  const blockers = release.readiness.blockers.length
  const launch = {
    label: t('workspace.next.openLaunch'),
    stage: 'launch',
  } as const
  switch (release.status) {
    case 'DRAFT':
      return blockers > 0
        ? {
            title: t('workspace.next.prepare'),
            description: tp({
              count: blockers,
              key: 'workspace.next.itemsLeft',
            }),
            label: t('common.continue'),
            stage: 'draft',
            hash: 'release-checklist-heading',
          }
        : {
            title: t('workspace.next.submit'),
            description: t('workspace.next.submitDescription'),
            label: t('workspace.next.submitLabel'),
            stage: 'draft',
            hash: 'release-submit-heading',
            dialog: { kind: 'submit' },
          }
    case 'SUBMITTED':
      return {
        title: t('workspace.review.waiting'),
        description: t('workspace.next.waitingDescription'),
        label: t('workspace.next.viewReview'),
        stage: 'review',
      }
    case 'REJECTED':
      return {
        title: t('workspace.next.rejected'),
        description: t('workspace.next.rejectedDescription'),
        label: t('workspace.next.openFeedback'),
        stage: 'review',
      }
    case 'READY':
      return {
        title: t('workspace.next.ready'),
        description: t('workspace.next.readyDescription'),
        ...launch,
      }
    case 'SCHEDULED':
      return {
        title: t('workspace.next.scheduled'),
        description: t('workspace.next.scheduledDescription'),
        ...launch,
      }
    case 'PUBLISHING':
      return {
        title: t('workspace.next.publishing'),
        description: t('workspace.next.publishingDescription'),
        ...launch,
      }
    case 'PUBLISH_FAILED':
      return {
        title: t('workspace.next.failed'),
        description: t('workspace.next.failedDescription'),
        ...launch,
      }
    case 'RELEASED':
      return {
        title: t('workspace.next.released'),
        description: t('workspace.next.releasedDescription'),
        ...launch,
      }
    case 'UNPUBLISHED':
      return {
        title: t('workspace.next.unpublished'),
        description: t('workspace.next.unpublishedDescription'),
        ...launch,
      }
  }
}

interface ReleaseHeaderProps {
  release: ReleaseWorkspace
  /** Opens the artwork dialog; without it the cover is display-only. */
  onAction?: WorkspaceActionHandler
}

/**
 * The release artwork. In a draft it is also the upload target: click to choose an image, or
 * drop one on it to open the artwork dialog with that file ready to save.
 */
function HeaderCover({
  release,
  onAction,
}: {
  release: ReleaseWorkspace
  onAction?: WorkspaceActionHandler
}) {
  const { t } = useI18n()
  const [over, setOver] = useState(false)
  const alt = t('workspace.artworkAlt', { title: release.title })
  if (release.status !== 'DRAFT' || !onAction)
    return release.cover ? (
      <img
        alt={alt}
        className="artist-release-cover"
        src={releaseCoverUrl(release.cover)}
      />
    ) : (
      <div className="artist-release-cover artist-release-cover-placeholder">
        <Music2 aria-hidden="true" />
      </div>
    )
  const label = release.cover
    ? t('workspace.draft.editArtwork')
    : t('workspace.draft.addArtwork')
  return (
    <button
      aria-label={label}
      className="artist-release-cover artist-release-cover-upload"
      data-empty={!release.cover}
      data-over={over}
      onClick={() => onAction({ kind: 'cover' })}
      onDragLeave={() => setOver(false)}
      onDragOver={(event) => {
        event.preventDefault()
        setOver(true)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)
        const file = event.dataTransfer.files[0]
        onAction(file ? { kind: 'cover', file } : { kind: 'cover' })
      }}
      type="button"
    >
      {release.cover && <img alt="" src={releaseCoverUrl(release.cover)} />}
      <span aria-hidden="true" className="artist-release-cover-hint">
        <ImagePlus />
        {label}
      </span>
    </button>
  )
}

/** Identity, status and the single next action; shared by every stage. */
export function ReleaseHeader({ release, onAction }: ReleaseHeaderProps) {
  const { t, tp, locale } = useI18n()
  const action = nextAction(release, t, tp)
  const StatusIcon = statusIcons[release.status]
  const tracks = release.trackCount
  return (
    <header className="artist-release-header">
      <img
        alt=""
        aria-hidden="true"
        className="artist-release-header-art"
        src="/artwork/releases/release-waveform.png"
      />
      <div className="artist-release-header-identity">
        <HeaderCover onAction={onAction} release={release} />
        <div className="min-w-0">
          <h1>{release.title}</h1>
          <p>
            {release.artistName} · {t(releaseTypeLabels[release.type])} ·{' '}
            {tp({ count: tracks, key: 'common.tracks' })}
          </p>
          <div className="artist-release-header-meta">
            <span className="artist-release-chip" data-status={release.status}>
              <StatusIcon aria-hidden="true" />
              {t(releaseStatusLabels[release.status])}
            </span>
            <span>
              {t('workspace.header.updated', {
                date: formatDateTimeUtc(release.updatedAt, locale),
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="artist-release-header-action">
        <div className="min-w-0">
          <p className="artist-release-eyebrow">
            {t('workspace.header.nextAction')}
          </p>
          <h2>{action.title}</h2>
          <p>{action.description}</p>
        </div>
        {action.dialog && onAction ? (
          <Button
            className="artist-workspace-primary rounded-full"
            onClick={() => action.dialog && onAction(action.dialog)}
            variant="primary"
          >
            {action.label}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        ) : (
          <Button
            asChild
            className="artist-workspace-primary rounded-full"
            variant="primary"
          >
            <Link
              hash={action.hash}
              params={{ releaseId: release.id }}
              search={{ step: action.stage }}
              to="/dashboard/music/$releaseId"
            >
              {action.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
