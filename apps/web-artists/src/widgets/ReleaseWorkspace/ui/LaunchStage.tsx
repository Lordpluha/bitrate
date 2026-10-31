import { Button, toast } from '@bitrate/ui-react'
import type { ReleaseWorkspace } from '@entities/release'
import { PublishRelease } from '@features/publish-release'
import { useI18n } from '@shared/i18n'
import { PLAYER_ROUTES } from '@shared/routes/routes'
import { LockedButton } from '@shared/ui'
import { ExternalLink, Link2, Megaphone, Share2 } from 'lucide-react'

interface LaunchStageProps {
  artistId: string
  release: ReleaseWorkspace
}

/** Stage 5: publication on Bitrate and what follows it. Only Bitrate publication is shown as done. */
export function LaunchStage({ artistId, release }: LaunchStageProps) {
  const live = release.status === 'RELEASED'
  const { t } = useI18n()
  const notLive = t('workspace.launch.notLive')
  return (
    <div className="artist-release-stage">
      <section
        aria-labelledby="release-publish-heading"
        className="artist-release-workspace-panel artist-release-stage-main"
      >
        <h2 id="release-publish-heading">
          {t('workspace.launch.publication')}
        </h2>
        <PublishRelease artistId={artistId} release={release} />
        <h2 className="mt-8" id="release-launch-heading">
          {t('workspace.launch.links')}
        </h2>
        <p>{t('workspace.launch.linksHint')}</p>
        <ul className="artist-release-rows">
          <li>
            <Link2 aria-hidden="true" />
            <span className="min-w-0">
              <span className="artist-release-row-title">Bitrate</span>
              <span>
                {live
                  ? t('workspace.launch.primaryPage')
                  : t('workspace.launch.publishedWhenLive')}
              </span>
            </span>
            <span
              className="artist-release-chip"
              data-status={live ? 'READY' : undefined}
            >
              {live
                ? t('workspace.launch.available')
                : t('workspace.launch.notLiveChip')}
            </span>
            {live && release.albumId ? (
              <PlayerLinkActions albumId={release.albumId} />
            ) : (
              <LockedButton reason={notLive} size="sm" variant="outline">
                {t('workspace.launch.copyLink')}
              </LockedButton>
            )}
          </li>
        </ul>
      </section>
      <section
        aria-labelledby="release-launch-next-heading"
        className="artist-release-workspace-panel artist-release-stage-side"
      >
        <h2 id="release-launch-next-heading">{t('workspace.whatNext')}</h2>
        <ol className="artist-release-next">
          <li data-state={live ? 'ready' : 'waiting'}>
            <span className="artist-release-next-icon">
              <Share2 aria-hidden="true" />
            </span>
            <span className="artist-release-next-text">
              <span className="artist-release-row-title">
                {t('workspace.launch.share')}
              </span>
              <span>
                {live
                  ? t('workspace.launch.readyToShare')
                  : t('workspace.launch.afterLive')}
              </span>
            </span>
          </li>
          <li data-state="soon">
            <span className="artist-release-next-icon">
              <Megaphone aria-hidden="true" />
            </span>
            <span className="artist-release-next-text">
              <span className="artist-release-row-title">
                {t('workspace.launch.promotionPlan')}
              </span>
              <span>{t('workspace.launch.optional')}</span>
            </span>
            <span className="artist-release-chip">
              {t('workspace.launch.soon')}
            </span>
          </li>
        </ol>
        <p className="artist-release-footnote">
          {t('workspace.launch.honest')}
        </p>
      </section>
    </div>
  )
}

/** Copy or open the release's album page in the Bitrate player. */
function PlayerLinkActions({ albumId }: { albumId: string }) {
  const url = PLAYER_ROUTES.album(albumId)
  const { t } = useI18n()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('workspace.launch.copied'))
    } catch {
      toast.error(t('workspace.launch.copyFailed', { url }))
    }
  }
  return (
    <div className="artist-release-row-actions">
      <Button
        onClick={() => {
          void copy()
        }}
        size="sm"
        variant="outline"
      >
        {t('workspace.launch.copyLink')}
      </Button>
      <Button asChild className="gap-1.5" size="sm" variant="outline">
        <a href={url} rel="noopener noreferrer" target="_blank">
          {t('workspace.launch.openInPlayer')}
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </Button>
    </div>
  )
}
