import { Button, toast } from '@bitrate/ui-react'
import {
  type ArtistReleaseChange,
  releaseChangeFieldLabels,
  releaseChangeStatusLabels,
  releaseCoverUrl,
  useReleaseChanges,
  useWithdrawReleaseChanges,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
import { MarkdownText, PanelIcon } from '@shared/ui'
import { ArrowRight, FilePen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { readSeenApproval, rememberSeenApproval } from '../model/seenApprovals'
import { ProposeReleaseChangesDialog } from './ProposeReleaseChangesDialog'

interface ReleaseChangesPanelProps {
  artistId: string
  release: { id: string; title: string; cover: string | null }
  /** Recordings first published in this release, by draft id. */
  recordings: { id: string; title: string }[]
}

/**
 * Changes proposed after publication: what waits for review as old → new, and the latest
 * decision for each title, cover and recording. An approval shows until the next visit.
 */
export function ReleaseChangesPanel({
  artistId,
  release,
  recordings,
}: ReleaseChangesPanelProps) {
  const { t, tMessage } = useI18n()
  const changes = useReleaseChanges(artistId, release.id)
  const withdraw = useWithdrawReleaseChanges(artistId)
  const [proposing, setProposing] = useState(false)
  const [seenApproval] = useState(() => readSeenApproval(release.id))
  const newestApproval = (changes.data ?? [])
    .filter((change) => change.status === 'APPROVED' && change.decidedAt)
    .map((change) => change.decidedAt as string)
    .sort()
    .at(-1)
  useEffect(() => {
    if (newestApproval) rememberSeenApproval(release.id, newestApproval)
  }, [newestApproval, release.id])

  const visible = (changes.data ?? []).filter(
    (change) =>
      change.status !== 'APPROVED' ||
      seenApproval === null ||
      Date.parse(change.decidedAt ?? '') > seenApproval,
  )
  const pendingRequests = [
    ...new Set(
      visible
        .filter((change) => change.status === 'PENDING')
        .map((change) => change.requestId),
    ),
  ]
  const recordingTitle = (id: string | null) =>
    recordings.find((recording) => recording.id === id)?.title

  return (
    <section
      aria-labelledby="release-changes-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-changes-heading">
          <PanelIcon icon={FilePen} />
          {t('releaseChanges.panel.title')}
        </h2>
        <Button onClick={() => setProposing(true)} variant="outline">
          {t('releaseChanges.propose')}
        </Button>
      </div>
      <p>{t('releaseChanges.panel.hint')}</p>
      {changes.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(changes.error.message)}
        </p>
      )}
      {changes.isSuccess && visible.length === 0 && (
        <p className="text-sm text-text-secondary">
          {t('releaseChanges.panel.empty')}
        </p>
      )}
      {visible.length > 0 && (
        <ul className="artist-release-rows">
          {visible.map((change) => (
            <ChangeRow
              change={change}
              key={change.id}
              recordingTitle={recordingTitle(change.recordingId)}
            />
          ))}
        </ul>
      )}
      {pendingRequests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {pendingRequests.map((requestId) => (
            <Button
              disabled={withdraw.isPending}
              key={requestId}
              onClick={async () => {
                try {
                  await withdraw.mutateAsync({ id: release.id, requestId })
                  toast.success(t('releaseChanges.withdrawn'))
                } catch {
                  // The error line below explains it.
                }
              }}
              size="sm"
              variant="ghost"
            >
              {withdraw.isPending
                ? t('releaseChanges.withdrawing')
                : t('releaseChanges.withdraw')}
            </Button>
          ))}
        </div>
      )}
      {withdraw.error && (
        <p className="text-sm text-destructive" role="alert">
          {tMessage(withdraw.error.message)}
        </p>
      )}
      {proposing && (
        <ProposeReleaseChangesDialog
          artistId={artistId}
          onClose={() => setProposing(false)}
          recordings={recordings}
          release={release}
        />
      )}
    </section>
  )
}

function ChangeRow({
  change,
  recordingTitle,
}: {
  change: ArtistReleaseChange
  recordingTitle: string | undefined
}) {
  const { t } = useI18n()
  const label = t(releaseChangeFieldLabels[change.field])
  return (
    <li className="flex-col items-stretch">
      <span className="flex flex-wrap items-center gap-2">
        <span className="artist-release-row-title">
          {recordingTitle ? `${label} · ${recordingTitle}` : label}
        </span>
        <span
          className="artist-release-chip"
          data-status={
            change.status === 'APPROVED'
              ? 'READY'
              : change.status === 'REJECTED'
                ? 'NEEDS_CHANGES'
                : undefined
          }
        >
          {t(releaseChangeStatusLabels[change.status])}
        </span>
      </span>
      {change.field === 'RELEASE_COVER' ? (
        <span className="flex items-center gap-3">
          <CoverThumb src={change.previousValue} />
          <ArrowRight aria-hidden="true" className="size-4" />
          <CoverThumb src={change.proposedValue} />
        </span>
      ) : (
        <span className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-text-secondary line-through">
            {change.previousValue}
          </span>
          <ArrowRight aria-hidden="true" className="size-4" />
          <span className="font-medium">{change.proposedValue}</span>
        </span>
      )}
      {change.status === 'REJECTED' && change.reason && (
        <div className="space-y-1">
          <p className="text-xs font-medium">
            {t('releaseChanges.reviewerReason')}
          </p>
          <MarkdownText>{change.reason}</MarkdownText>
        </div>
      )}
      {change.reviewerMessage && change.status !== 'PENDING' && (
        <div className="space-y-1">
          <p className="text-xs font-medium">
            {t('releaseChanges.reviewerComment')}
          </p>
          <MarkdownText>{change.reviewerMessage}</MarkdownText>
        </div>
      )}
    </li>
  )
}

function CoverThumb({ src }: { src: string | null }) {
  const { t } = useI18n()
  if (!src)
    return (
      <span className="grid size-14 place-items-center rounded-lg bg-secondary text-center text-[0.6875rem] text-text-secondary">
        {t('releaseChanges.coverGone')}
      </span>
    )
  return (
    <img
      alt=""
      className="size-14 rounded-lg object-cover"
      src={releaseCoverUrl(src)}
    />
  )
}
