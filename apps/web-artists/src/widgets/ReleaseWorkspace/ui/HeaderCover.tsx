import { type ReleaseWorkspace, releaseCoverUrl } from '@entities/release'
import { useNowPlaying } from '@features/now-playing'
import { useI18n } from '@shared/i18n'
import { tiltHandlers } from '@shared/lib/tilt'
import { ImagePlus, Music2 } from 'lucide-react'
import { useState } from 'react'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface HeaderCoverProps {
  release: ReleaseWorkspace
  onAction?: WorkspaceActionHandler
}

/**
 * The artwork on its stage: it leans toward the pointer, and while one of the release's
 * tracks plays a record slides out from behind it and spins.
 */
export function HeaderCover({ release, onAction }: HeaderCoverProps) {
  const { current, status } = useNowPlaying()
  const playing = status === 'playing' && current?.releaseId === release.id
  return (
    <div className="artist-release-cover-stage" data-playing={playing}>
      <span aria-hidden="true" className="artist-release-vinyl">
        <span
          className="artist-release-vinyl-label"
          style={
            release.cover
              ? { backgroundImage: `url(${releaseCoverUrl(release.cover)})` }
              : undefined
          }
        />
      </span>
      <div className="artist-tilt" {...tiltHandlers}>
        <CoverArt onAction={onAction} release={release} />
      </div>
    </div>
  )
}

/**
 * The release artwork. In a draft it is also the upload target: click to choose an image, or
 * drop one on it to open the artwork dialog with that file ready to save.
 */
function CoverArt({
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
