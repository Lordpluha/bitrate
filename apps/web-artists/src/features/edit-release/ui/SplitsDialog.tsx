import type { ApiSchemas } from '@bitrate/contracts'
import { Button, Input } from '@bitrate/ui-react'
import {
  basisPointsToPercent,
  FULL_SHARE_BASIS_POINTS,
  type ReleaseWorkspace,
  rightTypeLabels,
  rightTypes,
  useSaveSplits,
} from '@entities/release'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { useId, useState } from 'react'
import { parseShares } from '../model/rights.schema'

type RightType = ApiSchemas['ReleaseRightType']
/** Entered percent per contributor, for each right. */
type ShareValues = Record<RightType, Record<string, string>>

interface SplitsDialogProps {
  artistId: string
  release: ReleaseWorkspace
  onClose: () => void
  onSaved: () => void
}

function savedValues(release: ReleaseWorkspace): ShareValues {
  const column = (rightType: RightType) =>
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
    )
  return { RECORDING: column('RECORDING'), COMPOSITION: column('COMPOSITION') }
}

const sameColumn = (a: Record<string, string>, b: Record<string, string>) =>
  Object.keys(a).every((key) => a[key].trim() === (b[key] ?? '').trim())

/** Master and publishing shares side by side; saving writes each changed right in turn. */
export function SplitsDialog({
  artistId,
  release,
  onClose,
  onSaved,
}: SplitsDialogProps) {
  const id = useId()
  const mutation = useSaveSplits(artistId)
  const [version, setVersion] = useState(release.updatedAt)
  const [saved, setSaved] = useState(() => savedValues(release))
  const [values, setValues] = useState(() => savedValues(release))
  const columns = rightTypes.map((rightType) => {
    const shares = parseShares(values[rightType])
    const total = shares?.reduce(
      (sum, share) => sum + share.shareBasisPoints,
      0,
    )
    const problem =
      shares === null
        ? `${rightTypeLabels[rightType]}: use a share between 0.01% and 100% with up to two decimals.`
        : total !== undefined && total > FULL_SHARE_BASIS_POINTS
          ? `${rightTypeLabels[rightType]} shares cannot exceed 100%.`
          : null
    return { rightType, shares, total, problem }
  })
  const problems = columns.flatMap((column) =>
    column.problem ? [column.problem] : [],
  )
  const busy = mutation.isPending
  const submit = async () => {
    if (problems.length > 0) return
    let current = version
    try {
      for (const { rightType, shares } of columns) {
        if (!shares || sameColumn(values[rightType], saved[rightType])) continue
        const result = await mutation.mutateAsync({
          id: release.id,
          input: { rightType, shares, expectedUpdatedAt: current },
        })
        current = result.release.updatedAt
        setVersion(current)
        setSaved((previous) => ({
          ...previous,
          [rightType]: values[rightType],
        }))
      }
      onSaved()
    } catch {
      // Keep the entered shares; a right already saved is not written again on retry.
    }
  }
  return (
    <WorkspaceModal
      canClose={!busy}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Splits"
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
          <strong>Master</strong> is the money from the recording itself;{' '}
          <strong>publishing</strong> is the money for the music and lyrics.
          Each column must reach exactly 100% before review; a draft can stay
          below.
        </p>
        {release.participants.length === 0 ? (
          <p role="status">Add contributors before assigning splits.</p>
        ) : (
          <fieldset className="space-y-3" disabled={busy}>
            <legend className="sr-only">Shares in percent</legend>
            <div
              aria-hidden="true"
              className="grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem] gap-3 text-xs text-text-secondary"
            >
              <span>Contributor</span>
              {rightTypes.map((rightType) => (
                <span className="text-right" key={rightType}>
                  {rightTypeLabels[rightType]}
                </span>
              ))}
            </div>
            {release.participants.map((participant, index) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem] items-center gap-3"
                key={participant.id}
              >
                <span className="truncate text-sm font-medium">
                  {participant.displayName}
                </span>
                {rightTypes.map((rightType) => (
                  <div className="flex items-center gap-1" key={rightType}>
                    <Input
                      aria-label={`${participant.displayName} ${rightTypeLabels[rightType].toLowerCase()} share`}
                      className="w-full text-right"
                      data-initial-focus={
                        index === 0 && rightType === 'RECORDING'
                          ? true
                          : undefined
                      }
                      id={`${id}-${rightType}-${participant.id}`}
                      inputMode="decimal"
                      onChange={(event) => {
                        mutation.reset()
                        const next = event.target.value
                        setValues((current) => ({
                          ...current,
                          [rightType]: {
                            ...current[rightType],
                            [participant.id]: next,
                          },
                        }))
                      }}
                      value={values[rightType][participant.id] ?? ''}
                    />
                    <span aria-hidden="true">%</span>
                  </div>
                ))}
              </div>
            ))}
          </fieldset>
        )}
        <ul aria-live="polite" className="space-y-1 text-sm font-medium">
          {columns.map(({ rightType, total }) => (
            <li key={rightType}>
              {rightTypeLabels[rightType]} total{' '}
              {total === undefined ? '—' : `${basisPointsToPercent(total)}%`} of
              100%
            </li>
          ))}
        </ul>
        {problems.length > 0 && (
          <p className="text-sm text-destructive" role="alert">
            {problems.join(' ')}
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
            disabled={busy || problems.length > 0}
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
