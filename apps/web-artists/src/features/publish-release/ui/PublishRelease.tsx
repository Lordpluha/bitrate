import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  useCancelPremiere,
  usePublishRelease,
  useRepublishRelease,
  useUnpublishRelease,
} from '@entities/release'
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
          label="Cancel premiere"
          pending="Cancelling…"
          release={release}
        >
          Premiere scheduled for{' '}
          {release.scheduledAt
            ? `${formatDateTimeUtc(release.scheduledAt)} UTC`
            : 'the chosen time'}
          . Your release goes live on Bitrate then. Cancel it to change the
          timing.
        </LaunchAction>
      )
    case 'PUBLISHING':
      return (
        <p role="status">
          Publishing on Bitrate… Your tracks are being prepared for the player,
          which usually takes a few minutes. Listeners see the release once
          every track is ready.
        </p>
      )
    case 'PUBLISH_FAILED':
      return (
        <p className="text-destructive" role="alert">
          Publishing failed — Bitrate has been notified and will retry. Your
          release stays approved.
        </p>
      )
    case 'RELEASED':
      return (
        <LaunchAction
          action={useUnpublishRelease}
          artistId={artistId}
          label="Take offline"
          pending="Taking offline…"
          release={release}
        >
          Live on Bitrate. Taking it offline stops its tracks everywhere until
          you publish it again.
        </LaunchAction>
      )
    case 'UNPUBLISHED':
      return release.unpublishedBy === 'ADMIN' ? (
        <p role="status">
          Bitrate took this release offline. Contact support to discuss it.
        </p>
      ) : (
        <LaunchAction
          action={useRepublishRelease}
          artistId={artistId}
          label="Publish again"
          pending="Publishing…"
          release={release}
        >
          Offline. Publishing it again needs no new review and does not notify
          your followers again.
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
          {write.error.message}
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
  return (
    <div className="space-y-3">
      <p>
        Approved by Bitrate. Publishing makes your tracks playable in the
        Bitrate player and notifies your followers once. Stores are not
        involved.
      </p>
      <Button
        className="artist-workspace-primary rounded-full"
        onClick={onPublish}
        variant="primary"
      >
        {premiere
          ? `Publish on ${formatDateTimeUtc(premiere)} UTC`
          : 'Publish now'}
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
      title="Publish on Bitrate"
    >
      <div aria-busy={publish.isPending} className="space-y-6">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-secondary">Release</dt>
          <dd className="font-medium">{release.title}</dd>
          <dt className="text-text-secondary">Tracks</dt>
          <dd>{release.trackCount}</dd>
          <dt className="text-text-secondary">Timing</dt>
          <dd>
            {premiere
              ? `Premiere on ${formatDateTimeUtc(premiere)} UTC`
              : 'Right away'}
          </dd>
        </dl>
        <p className="text-sm text-text-secondary">
          Need another look? Every stage stays open until you publish.
        </p>
        {publish.error && (
          <p className="text-sm text-destructive" role="alert">
            {publish.error.message}
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
            Keep reviewing
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
              ? 'Publishing…'
              : premiere
                ? 'Schedule premiere'
                : 'Publish now'}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
