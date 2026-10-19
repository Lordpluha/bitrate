import type { ApiSchemas } from '@bitrate/contracts'
import { Button, Input } from '@bitrate/ui-react'
import {
  basisPointsToPercent,
  FULL_SHARE_BASIS_POINTS,
  type ReleaseWorkspace,
  rightTypeLabels,
  useSaveSplits,
} from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'
import { parseShares } from '../model/rights.schema'

interface SplitsDialogProps {
  artistId: string
  release: ReleaseWorkspace
  rightType: ApiSchemas['ReleaseRightType']
  onClose: () => void
  onSaved: () => void
}

export function SplitsDialog({
  artistId,
  release,
  rightType,
  onClose,
  onSaved,
}: SplitsDialogProps) {
  const id = useId()
  const mutation = useSaveSplits(artistId)
  const [expectedUpdatedAt] = useState(release.updatedAt)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      release.participants.map((participant) => {
        const split = release.splits.find(
          (item) =>
            item.contributorId === participant.id &&
            item.rightType === rightType,
        )
        return [
          participant.id,
          split ? basisPointsToPercent(split.shareBasisPoints) : '',
        ]
      }),
    ),
  )
  const shares = parseShares(values)
  const total = shares?.reduce((sum, share) => sum + share.shareBasisPoints, 0)
  const problem =
    shares === null
      ? 'Use a share between 0.01% and 100% with up to two decimals.'
      : total !== undefined && total > FULL_SHARE_BASIS_POINTS
        ? 'Shares cannot exceed 100%.'
        : null
  const busy = mutation.isPending
  const label = rightTypeLabels[rightType]
  const submit = async () => {
    if (!shares || problem) return
    try {
      await mutation.mutateAsync({
        id: release.id,
        input: { rightType, shares, expectedUpdatedAt },
      })
      onSaved()
    } catch {
      // Keep the entered shares when the write is rejected or unconfirmed.
    }
  }
  return (
    <WorkspaceModal
      canClose={!busy}
      className="artist-release-credit-modal"
      onClose={onClose}
      title={`${label} splits`}
    >
      <form
        aria-busy={busy}
        className="space-y-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <p className="text-sm text-text-secondary">
          Assign each contributor's share of the{' '}
          {rightType === 'RECORDING' ? 'master recording' : 'composition'}. A
          draft can stay below 100%; review requires exactly 100%. Saving clears
          the accuracy confirmation.
        </p>
        {release.participants.length === 0 ? (
          <p role="status">Add contributors before assigning splits.</p>
        ) : (
          <fieldset className="space-y-3" disabled={busy}>
            <legend className="sr-only">{label} shares in percent</legend>
            {release.participants.map((participant, index) => (
              <div
                className="flex items-center justify-between gap-4"
                key={participant.id}
              >
                <label
                  className="text-sm font-medium"
                  htmlFor={`${id}-${participant.id}`}
                >
                  {participant.displayName}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-24 text-right"
                    data-initial-focus={index === 0 ? true : undefined}
                    id={`${id}-${participant.id}`}
                    inputMode="decimal"
                    onChange={(event) => {
                      mutation.reset()
                      setValues((current) => ({
                        ...current,
                        [participant.id]: event.target.value,
                      }))
                    }}
                    value={values[participant.id] ?? ''}
                  />
                  <span aria-hidden="true">%</span>
                </div>
              </div>
            ))}
          </fieldset>
        )}
        <p aria-live="polite" className="text-sm font-medium" role="status">
          Total {total === undefined ? '—' : `${basisPointsToPercent(total)}%`}{' '}
          of 100%
        </p>
        {problem && (
          <p className="text-sm text-destructive" role="alert">
            {problem}
          </p>
        )}
        {mutation.error && (
          <p className="text-sm text-destructive" role="alert">
            {mutation.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={busy}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={busy || problem !== null}
            type="submit"
            variant="primary"
          >
            {busy ? 'Saving splits…' : 'Save splits'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}
