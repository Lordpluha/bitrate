import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useCancelPremiere,
  usePublishRelease,
  useRepublishRelease,
  useUnpublishRelease,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { type ReactNode, useState } from 'react'

interface PublishReleaseProps {
  artistId: string
  release: ReleaseWorkspace
}

/** A premiere still ahead; a past or missing time publishes right away. */
function premiereOf(release: ReleaseWorkspace): string | null {
  const at = release.scheduledAt
  return at && Date.parse(at) > Date.now() ? at : null
}

/** Bitrate publication on Launch: publish an approved release and follow it going live. */
export function PublishRelease({ artistId, release }: PublishReleaseProps) {
  const [confirming, setConfirming] = useState(false)
  const { t, locale } = useI18n()
  switch (release.status) {
    case 'READY':
      return (
        <>
          <PublishPrompt
            onPublish={() => setConfirming(true)}
            premiere={premiereOf(release)}
          />
          {confirming && (
            <PublishDialog
              artistId={artistId}
              onClose={() => setConfirming(false)}
              release={release}
            />
          )}
        </>
      )
    case 'SCHEDULED':
      return (
        <LaunchAction
          action={useCancelPremiere}
          artistId={artistId}
          label={t('publish.cancelPremiere')}
          pending={t('publish.cancelling')}
          release={release}
        >
          {t('publish.scheduledFor', {
            date: release.scheduledAt
              ? `${formatDateTimeUtc(release.scheduledAt, locale)} UTC`
              : t('publish.chosenTime'),
          })}
        </LaunchAction>
      )
    case 'PUBLISHING':
      return <p role="status">{t('publish.publishing')}</p>
    case 'PUBLISH_FAILED':
      return (
        <p className="text-destructive" role="alert">
          {t('publish.failed')}
        </p>
      )
    case 'RELEASED':
      return (
        <LaunchAction
          action={useUnpublishRelease}
          artistId={artistId}
          label={t('publish.takeOffline')}
          pending={t('publish.takingOffline')}
          release={release}
        >
          {t('publish.live')}
        </LaunchAction>
      )
    case 'UNPUBLISHED':
      return release.unpublishedBy === 'ADMIN' ? (
        <p role="status">{t('publish.adminOffline')}</p>
      ) : (
        <LaunchAction
          action={useRepublishRelease}
          artistId={artistId}
          label={t('publish.publishAgain')}
          pending={t('publish.publishingShort')}
          release={release}
        >
          {t('publish.offline')}
        </LaunchAction>
      )
    default:
      return null
  }
}

/** A status line with one owner action that moves the release on. */
function LaunchAction({
  artistId,
  release,
  action,
  label,
  pending,
  children,
}: {
  artistId: string
  release: ReleaseWorkspace
  action: typeof useUnpublishRelease
  label: string
  pending: string
  children: ReactNode
}) {
  const { tMessage } = useI18n()
  const write = action(artistId)
  return (
    <div className="space-y-3">
      <p role="status">{children}</p>
      <Button
        className="rounded-full"
        disabled={write.isPending}
        onClick={() => {
          write.mutate({
            id: release.id,
            input: { expectedUpdatedAt: release.updatedAt },
          })
        }}
        variant="outline"
      >
        {write.isPending ? pending : label}
      </Button>
      {write.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(write.error.message)}
        </p>
      )}
    </div>
  )
}

function PublishPrompt({
  premiere,
  onPublish,
}: {
  premiere: string | null
  onPublish: () => void
}) {
  const { t, locale } = useI18n()
  return (
    <div className="space-y-3">
      <p>{t('publish.prompt')}</p>
      <Button
        className="artist-workspace-primary rounded-full"
        onClick={onPublish}
        variant="primary"
      >
        {premiere
          ? t('publish.publishOn', {
              date: formatDateTimeUtc(premiere, locale),
            })
          : t('publish.publishNow')}
      </Button>
    </div>
  )
}

function PublishDialog({
  artistId,
  release,
  onClose,
}: {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
}) {
  const { t, tMessage, locale } = useI18n()
  const publish = usePublishRelease(artistId)
  const premiere = premiereOf(release)
  const confirm = async () => {
    try {
      await publish.mutateAsync({
        id: release.id,
        input: { expectedUpdatedAt: release.updatedAt },
      })
      onClose()
    } catch {
      // The release stays approved; the error explains what to do next.
    }
  }
  return (
    <WorkspaceModal
      canClose={!publish.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={t('workspace.next.ready')}
    >
      <div aria-busy={publish.isPending} className="space-y-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-secondary">{t('publish.release')}</dt>
          <dd className="font-medium">{release.title}</dd>
          <dt className="text-text-secondary">{t('publish.tracks')}</dt>
          <dd>{release.trackCount}</dd>
          <dt className="text-text-secondary">{t('publish.timing')}</dt>
          <dd>
            {premiere
              ? t('publish.premiereOn', {
                  date: formatDateTimeUtc(premiere, locale),
                })
              : t('editRelease.rightAway')}
          </dd>
        </dl>
        <p className="text-sm text-text-secondary">
          {t('publish.anotherLook')}
        </p>
        {publish.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(publish.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            data-initial-focus
            disabled={publish.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {t('publish.keepReviewing')}
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={publish.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="primary"
          >
            {publish.isPending
              ? t('publish.publishingShort')
              : premiere
                ? t('publish.schedulePremiere')
                : t('publish.publishNow')}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
