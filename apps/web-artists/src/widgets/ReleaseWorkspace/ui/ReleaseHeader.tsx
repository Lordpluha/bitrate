import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  releaseCoverUrl,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { useArtworkAmbience } from '@shared/lib/artworkAmbience'
import { formatDateTimeUtc } from '@shared/lib/date'
import { Countdown } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { nextAction, statusIcons } from '../lib/nextAction'
import { useCelebration } from '../lib/useCelebration'
import type { WorkspaceActionHandler } from '../model/workspaceAction'
import { HeaderCover } from './HeaderCover'

interface ReleaseHeaderProps {
  release: ReleaseWorkspace
  /** Opens the artwork dialog; without it the cover is display-only. */
  onAction?: WorkspaceActionHandler
  titleEditor?: ReactNode
}

/** Identity, status and the single next action; shared by every stage. */
export function ReleaseHeader({
  release,
  onAction,
  titleEditor,
}: ReleaseHeaderProps) {
  const { t, tp, locale } = useI18n()
  const action = nextAction(release, t, tp)
  const StatusIcon = statusIcons[release.status]
  const tracks = release.trackCount
  useCelebration(release)
  useArtworkAmbience(release.cover ? releaseCoverUrl(release.cover) : null)
  const premiere =
    release.scheduledAt && Date.parse(release.scheduledAt) > Date.now()
      ? release.scheduledAt
      : null
  return (
    <header className="artist-release-header">
      {release.cover && (
        <span aria-hidden="true" className="artist-cover-wash">
          <img alt="" src={releaseCoverUrl(release.cover)} />
        </span>
      )}
      <img
        alt=""
        aria-hidden="true"
        className="artist-release-header-art"
        src="/artwork/releases/release-header-a.webp"
      />
      <div className="artist-release-header-identity">
        <HeaderCover onAction={onAction} release={release} />
        <div className="min-w-0">
          {titleEditor ?? <h1>{release.title}</h1>}
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
          {premiere && (
            <Countdown
              className="artist-release-header-countdown"
              to={premiere}
            />
          )}
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
