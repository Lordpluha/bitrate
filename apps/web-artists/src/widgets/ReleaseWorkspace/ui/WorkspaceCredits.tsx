import { Button } from '@bitrate/ui-react'
import {
  basisPointsToPercent,
  FULL_SHARE_BASIS_POINTS,
  participantRoleLabels,
  type ReleaseWorkspace,
  rightTypeLabels,
  rightTypes,
} from '@entities/release'
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Pencil,
  Trash2,
  UserRoundCheck,
} from 'lucide-react'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface WorkspaceCreditsProps {
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

/** Who made the release, their roles and their share of each right, in one place. */
export function WorkspaceCredits({ release, onAction }: WorkspaceCreditsProps) {
  const draft = release.status === 'DRAFT'
  const share = (contributorId: string, rightType: string) =>
    release.splits.find(
      (split) =>
        split.contributorId === contributorId && split.rightType === rightType,
    )?.shareBasisPoints ?? 0
  const totals = rightTypes.map((rightType) => ({
    rightType,
    total: release.splits
      .filter((split) => split.rightType === rightType)
      .reduce((sum, split) => sum + split.shareBasisPoints, 0),
  }))
  return (
    <section
      aria-labelledby="release-credits-heading"
      className="artist-release-workspace-panel artist-release-participants"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-credits-heading">
          Credits &amp; splits <span>({release.participantCount})</span>
        </h2>
        {draft && release.participantCount > 0 && (
          <Button
            className="rounded-full"
            onClick={() => onAction({ kind: 'splits' })}
            size="sm"
            variant="outline"
          >
            Edit splits
          </Button>
        )}
      </div>
      <p>
        Who made this release, what they did, and their share of the master (the
        recording) and publishing (the music and lyrics).
      </p>
      <ul aria-label="Split totals" className="artist-release-credit-totals">
        {totals.map(({ rightType, total }) => {
          const complete = total === FULL_SHARE_BASIS_POINTS
          return (
            <li data-done={complete} key={rightType}>
              {complete ? (
                <CircleCheck aria-hidden="true" />
              ) : (
                <CircleDashed aria-hidden="true" />
              )}
              {rightTypeLabels[rightType]} {basisPointsToPercent(total)}% of
              100%
            </li>
          )
        })}
      </ul>
      {release.participants.length === 0 ? (
        <p>
          No credited participants yet.
          {draft &&
            ' Made everything yourself? Credit yourself in one step; working with others, add each contributor.'}
        </p>
      ) : (
        <ul className="artist-release-credit-list">
          {release.participants.map((person) => {
            const missingRole = person.roles.length === 0
            return (
              <li data-missing-role={missingRole} key={person.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3>{person.displayName}</h3>
                    {missingRole && (
                      <span className="artist-release-credit-warning">
                        <CircleAlert
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                        Needs role
                      </span>
                    )}
                    <p>
                      {person.roles
                        .map((role) => participantRoleLabels[role])
                        .join(' · ') || 'No roles specified'}
                    </p>
                    <p className="artist-release-credit-shares">
                      {rightTypes
                        .map(
                          (rightType) =>
                            `${rightTypeLabels[rightType]} ${basisPointsToPercent(share(person.id, rightType))}%`,
                        )
                        .join(' · ')}
                    </p>
                    {missingRole && (
                      <p className="artist-release-credit-helper">
                        Assign at least one role.
                      </p>
                    )}
                  </div>
                  {draft && (
                    <div className="flex shrink-0 items-center">
                      <Button
                        aria-label={
                          missingRole
                            ? `Edit roles for ${person.displayName}`
                            : `Edit contributor ${person.displayName}`
                        }
                        className="min-h-11 min-w-11"
                        onClick={() =>
                          onAction({
                            kind: 'contributor-edit',
                            contributorId: person.id,
                          })
                        }
                        size={missingRole ? 'sm' : 'icon'}
                        variant="ghost"
                      >
                        {missingRole ? (
                          'Edit roles'
                        ) : (
                          <Pencil aria-hidden="true" className="size-4" />
                        )}
                      </Button>
                      <Button
                        aria-label={`Remove contributor ${person.displayName}`}
                        className="min-h-11 min-w-11"
                        onClick={() =>
                          onAction({
                            kind: 'contributor-remove',
                            contributorId: person.id,
                          })
                        }
                        size="icon"
                        title="Remove contributor"
                        variant="ghost"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {release.participantCount > release.participants.length && (
        <p>
          Showing {release.participants.length} of {release.participantCount}{' '}
          participants.
        </p>
      )}
      {draft && (
        <div className="mt-4 flex flex-wrap gap-2">
          {release.participantCount === 0 && (
            <Button
              className="gap-1.5 rounded-full"
              onClick={() => onAction({ kind: 'contributor-self' })}
              size="sm"
              variant="outline"
            >
              <UserRoundCheck aria-hidden="true" className="size-4" />I made it
              myself
            </Button>
          )}
          <Button
            className="rounded-full"
            onClick={() => onAction({ kind: 'contributor-add' })}
            size="sm"
            variant="outline"
          >
            Add contributor
          </Button>
        </div>
      )}
      <p className="artist-release-footnote">
        Credits do not grant workspace access. Each split must reach exactly
        100% before review.
      </p>
    </section>
  )
}
