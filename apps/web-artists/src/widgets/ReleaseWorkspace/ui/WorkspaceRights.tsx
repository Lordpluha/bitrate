import type { ApiSchemas } from '@bitrate/contracts'
import { Button } from '@bitrate/ui-react'
import {
  basisPointsToPercent,
  formatUpc,
  type ReleaseWorkspace,
  rightTypeLabels,
  rightTypes,
} from '@entities/release'
import { Check, Circle } from 'lucide-react'

export type RightsAction =
  | { kind: 'rights' }
  | { kind: 'upc' }
  | { kind: 'splits'; rightType: ApiSchemas['ReleaseRightType'] }

interface WorkspaceRightsProps {
  release: ReleaseWorkspace
  onAction: (action: RightsAction) => void
}

function Confirmation({ done, label }: { done: boolean; label: string }) {
  const Icon = done ? Check : Circle
  return (
    <li className="flex items-center gap-2">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
      <span>{label}</span>
      <span className="sr-only">
        {done ? '(confirmed)' : '(not confirmed)'}
      </span>
    </li>
  )
}

export function WorkspaceRights({ release, onAction }: WorkspaceRightsProps) {
  const draft = release.status === 'DRAFT'
  const { rights } = release
  const names = new Map(
    release.participants.map((person) => [person.id, person.displayName]),
  )
  const owner =
    rights.masterOwnerType === 'ARTIST'
      ? `${release.artistName} (this artist)`
      : (rights.masterOwnerName ?? 'Not chosen')
  return (
    <section
      aria-labelledby="release-rights-heading"
      className="artist-release-workspace-panel artist-release-rights"
    >
      <h2 id="release-rights-heading">Rights and identifiers</h2>
      <p>Confirm the rights information before review.</p>
      <dl>
        <div>
          <dt>Master owner</dt>
          <dd>{owner}</dd>
        </div>
        <div>
          <dt>UPC/EAN</dt>
          <dd>{release.upc ? formatUpc(release.upc) : 'Not provided'}</dd>
        </div>
      </dl>
      <ul className="space-y-1 text-sm">
        <Confirmation
          done={rights.writersConfirmedAt !== null}
          label="All songwriters and composers are listed"
        />
        <Confirmation
          done={rights.accuracyConfirmedAt !== null}
          label="Information confirmed as accurate"
        />
      </ul>
      {rightTypes.map((rightType) => {
        const shares = release.splits.filter(
          (split) => split.rightType === rightType,
        )
        const total = shares.reduce(
          (sum, split) => sum + split.shareBasisPoints,
          0,
        )
        return (
          <div className="space-y-1" key={rightType}>
            <h3>
              {rightTypeLabels[rightType]} splits{' '}
              <span>({basisPointsToPercent(total)}% of 100%)</span>
            </h3>
            {shares.length === 0 ? (
              <p>No shares assigned yet.</p>
            ) : (
              <ul className="text-sm">
                {shares.map((split) => (
                  <li key={split.contributorId}>
                    {names.get(split.contributorId) ?? 'Credited contributor'} ·{' '}
                    {basisPointsToPercent(split.shareBasisPoints)}%
                  </li>
                ))}
              </ul>
            )}
            {draft && (
              <Button
                onClick={() => onAction({ kind: 'splits', rightType })}
                size="sm"
                variant="outline"
              >
                Edit {rightTypeLabels[rightType].toLowerCase()} splits
              </Button>
            )}
          </div>
        )
      })}
      {draft && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onAction({ kind: 'rights' })}
            size="sm"
            variant="outline"
          >
            Edit rights
          </Button>
          <Button
            onClick={() => onAction({ kind: 'upc' })}
            size="sm"
            variant="outline"
          >
            Edit UPC
          </Button>
        </div>
      )}
    </section>
  )
}
