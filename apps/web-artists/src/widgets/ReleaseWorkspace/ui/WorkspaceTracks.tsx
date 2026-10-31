import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  releaseCoverUrl,
  useReorderTracks,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { Music2, Upload } from 'lucide-react'
import { durationLabel, isrcLabel } from '../lib/trackLabels'
import type { WorkspaceActionHandler } from '../model/workspaceAction'
import { DraftTrackRow } from './DraftTrackRow'

interface WorkspaceTracksProps {
  artistId: string
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

/** Swaps a recording with its neighbour; the API receives the whole new order. */
function movedOrder(ids: string[], index: number, step: -1 | 1) {
  const next = [...ids]
  const target = index + step
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export function WorkspaceTracks({
  artistId,
  release,
  onAction,
}: WorkspaceTracksProps) {
  const draft = release.status === 'DRAFT'
  const { t, tMessage } = useI18n()
  // Drafts and linked tracks are the same recordings seen twice; linked ones show only for
  // releases that have no drafts.
  const linked = release.trackDrafts.length === 0 ? release.tracks : []
  const shown = release.trackDrafts.length + linked.length
  const reorder = useReorderTracks(artistId)
  const ids = release.trackDrafts.map((track) => track.id)
  // Partial lists cannot be reordered safely; the API needs every recording.
  const canReorder = draft && ids.length > 1 && release.trackCount === shown
  const move = (index: number, step: -1 | 1) =>
    reorder.mutate({
      id: release.id,
      trackIds: movedOrder(ids, index, step),
      expectedUpdatedAt: release.updatedAt,
    })
  return (
    <section
      aria-labelledby="release-tracks-heading"
      className="artist-release-workspace-panel artist-release-tracks"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-tracks-heading">
          {t('workspace.tracks.title')} <span>({release.trackCount})</span>
        </h2>
        {draft && (
          <Button
            className="gap-1.5"
            onClick={() => onAction({ kind: 'track-add' })}
            size="sm"
            variant="outline"
          >
            <Upload aria-hidden="true" className="size-4" />
            {t('music.uploadTrack')}
          </Button>
        )}
      </div>
      <p>{t('workspace.tracks.description')}</p>
      {reorder.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(reorder.error.message)}
        </p>
      )}
      {shown === 0 ? (
        <div className="artist-release-inset">
          <Music2 aria-hidden="true" className="size-5 shrink-0 text-accent" />
          <p>
            {draft
              ? t('workspace.tracks.emptyDraft')
              : t('workspace.tracks.empty')}
          </p>
        </div>
      ) : (
        <ul>
          {release.trackDrafts.map((track, index) => (
            <DraftTrackRow
              count={ids.length}
              coverUrl={release.cover && releaseCoverUrl(release.cover)}
              editable={draft}
              index={index}
              key={track.id}
              onAction={onAction}
              releaseId={release.id}
              reorder={
                canReorder
                  ? {
                      pending: reorder.isPending,
                      onMove: (step) => move(index, step),
                    }
                  : undefined
              }
              track={track}
            />
          ))}
          {linked.map((track) => (
            <li key={track.id}>
              <div className="artist-release-track-head">
                <span className="artist-release-track-index">
                  {track.position}
                </span>
                <div className="min-w-0 flex-1">
                  <h3>{track.title}</h3>
                  <p>
                    {t('workspace.tracks.linked', {
                      duration: durationLabel(track.duration, t),
                    })}{' '}
                    · {isrcLabel(track.isrc, t)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {release.trackCount > shown && (
        <p>
          {t('workspace.tracks.partial', {
            shown,
            total: release.trackCount,
          })}
        </p>
      )}
    </section>
  )
}
