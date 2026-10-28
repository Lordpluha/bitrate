import { Button, toast } from '@bitrate/ui-react'
import type { ReleaseWorkspace } from '@entities/release'
import { PublishRelease } from '@features/publish-release'
import { PLAYER_ROUTES } from '@shared/routes/routes'
import { LockedButton } from '@shared/ui'
import { ExternalLink, Info, Link2, Megaphone, Share2 } from 'lucide-react'

const NOT_LIVE = 'Available once the release goes live on Bitrate.'
const COMING_SOON = 'Coming soon to the artist workspace.'

interface LaunchStageProps {
  artistId: string
  release: ReleaseWorkspace
}

/** Stage 5: publication on Bitrate and what follows it. Only Bitrate publication is shown as done. */
export function LaunchStage({ artistId, release }: LaunchStageProps) {
  const live = release.status === 'RELEASED'
  return (
    <div className="artist-release-stage">
      <section
        aria-labelledby="release-publish-heading"
        className="artist-release-workspace-panel artist-release-stage-main"
      >
        <h2 id="release-publish-heading">Bitrate publication</h2>
        <PublishRelease artistId={artistId} release={release} />
        <h2 className="mt-8" id="release-launch-heading">
          Release links
        </h2>
        <p>
          Availability is shown per destination; missing links are never
          implied.
        </p>
        <ul className="artist-release-rows">
          <li>
            <Link2 aria-hidden="true" />
            <span className="min-w-0">
              <span className="artist-release-row-title">Bitrate</span>
              <span>
                {live
                  ? 'Primary release page'
                  : 'Published when the release goes live'}
              </span>
            </span>
            <span
              className="artist-release-chip"
              data-status={live ? 'READY' : undefined}
            >
              {live ? 'Available' : 'Not live'}
            </span>
            {live && release.albumId ? (
              <PlayerLinkActions albumId={release.albumId} />
            ) : (
              <LockedButton reason={NOT_LIVE} size="sm" variant="outline">
                Copy link
              </LockedButton>
            )}
          </li>
        </ul>
      </section>
      <section
        aria-labelledby="release-launch-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-launch-next-heading">What happens next</h2>
        <ul className="artist-release-rows">
          <li>
            <Share2 aria-hidden="true" />
            <span className="min-w-0">
              <span className="artist-release-row-title">
                Share the Bitrate link
              </span>
              <span>
                {live ? 'Ready to share' : 'After the release goes live'}
              </span>
            </span>
          </li>
          <li>
            <Megaphone aria-hidden="true" />
            <span className="min-w-0">
              <span className="artist-release-row-title">
                Prepare a promotion plan
              </span>
              <span>Optional · Coming soon</span>
            </span>
          </li>
        </ul>
        <LockedButton
          className="mt-4 w-full rounded-full"
          reason={live ? COMING_SOON : NOT_LIVE}
          variant="outline"
        >
          Plan promotion
        </LockedButton>
        <p className="artist-release-honest">
          <Info aria-hidden="true" />
          Only Bitrate publication is shown as complete here.
        </p>
      </section>
    </div>
  )
}

/** Copy or open the release's album page in the Bitrate player. */
function PlayerLinkActions({ albumId }: { albumId: string }) {
  const url = PLAYER_ROUTES.album(albumId)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    } catch {
      toast.error(`Could not copy the link. Copy it manually: ${url}`)
    }
  }
  return (
    <span className="flex flex-wrap gap-2">
      <Button
        onClick={() => {
          void copy()
        }}
        size="sm"
        variant="outline"
      >
        Copy link
      </Button>
      <Button asChild size="sm" variant="outline">
        <a href={url} rel="noopener noreferrer" target="_blank">
          Open in player
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </Button>
    </span>
  )
}
