import { Button } from '@bitrate/ui-react'
import {
  type ReleaseStage,
  type ReleaseWorkspace,
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Clock,
  type LucideIcon,
  Music2,
  PencilLine,
} from 'lucide-react'

const updated = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

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
}

function nextAction(release: ReleaseWorkspace): NextAction {
  const blockers = release.readiness.blockers.length
  switch (release.status) {
    case 'DRAFT':
      return blockers > 0
        ? {
            title: 'Finish preparing your release',
            description: `${blockers} ${blockers === 1 ? 'item is' : 'items are'} left before Bitrate review.`,
            label: 'Continue',
            stage: 'draft',
            hash: 'release-checklist-heading',
          }
        : {
            title: 'Submit for Bitrate review',
            description: 'Everything required is ready. Confirm and submit.',
            label: 'Review and submit',
            stage: 'draft',
            hash: 'release-submit-heading',
          }
    case 'SUBMITTED':
      return {
        title: 'Waiting for a reviewer',
        description: 'You will be notified when Bitrate decides.',
        label: 'View review',
        stage: 'review',
      }
    case 'REJECTED':
      return {
        title: 'Address the requested changes',
        description: 'Bitrate asked for changes before approval.',
        label: 'Open feedback',
        stage: 'review',
      }
    case 'READY':
      return {
        title: 'Publish on Bitrate',
        description: 'Approved by Bitrate. Publish when you are ready.',
        label: 'Open launch',
        stage: 'launch',
      }
    case 'SCHEDULED':
      return {
        title: 'Premiere scheduled',
        description: 'Your release goes live on Bitrate at the premiere time.',
        label: 'Open launch',
        stage: 'launch',
      }
    case 'PUBLISHING':
      return {
        title: 'Publishing on Bitrate',
        description: 'Your tracks are being prepared for the player.',
        label: 'Open launch',
        stage: 'launch',
      }
    case 'PUBLISH_FAILED':
      return {
        title: 'Publishing failed',
        description: 'Bitrate has been notified and will retry.',
        label: 'Open launch',
        stage: 'launch',
      }
    case 'RELEASED':
      return {
        title: 'Your release is live on Bitrate',
        description: 'Share it and follow the first signals.',
        label: 'Open launch',
        stage: 'launch',
      }
    case 'UNPUBLISHED':
      return {
        title: 'Your release is offline',
        description: 'Listeners cannot play it until it is published again.',
        label: 'Open launch',
        stage: 'launch',
      }
  }
}

interface ReleaseHeaderProps {
  release: ReleaseWorkspace
}

/** Identity, status and the single next action; shared by every stage. */
export function ReleaseHeader({ release }: ReleaseHeaderProps) {
  const action = nextAction(release)
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
        {release.cover ? (
          <img
            alt={`${release.title} artwork`}
            className="artist-release-cover"
            src={releaseCoverUrl(release.cover)}
          />
        ) : (
          <div className="artist-release-cover artist-release-cover-placeholder">
            <Music2 aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <h1>{release.title}</h1>
          <p>
            {release.artistName} · {releaseTypeLabels[release.type]} · {tracks}{' '}
            {tracks === 1 ? 'track' : 'tracks'}
          </p>
          <div className="artist-release-header-meta">
            <span className="artist-release-chip" data-status={release.status}>
              <StatusIcon aria-hidden="true" />
              {releaseStatusLabels[release.status]}
            </span>
            <span>
              Updated {updated.format(new Date(release.updatedAt))} UTC
            </span>
          </div>
        </div>
      </div>
      <div className="artist-release-header-action">
        <div className="min-w-0">
          <p className="artist-release-eyebrow">Next action</p>
          <h2>{action.title}</h2>
          <p>{action.description}</p>
        </div>
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
      </div>
    </header>
  )
}
