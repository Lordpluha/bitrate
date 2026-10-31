import { Button } from '@bitrate/ui-react'
import {
  basisPointsToPercent,
  FULL_SHARE_BASIS_POINTS,
  participantRoleLabels,
  type ReleaseWorkspace,
  rightTypeLabels,
  splitRightTypes,
} from '@entities/release'
import { useI18n } from '@shared/i18n'
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
  const { t } = useI18n()
  const share = (contributorId: string, rightType: string) =>
    release.splits.find(
      (split) =>
        split.contributorId === contributorId && split.rightType === rightType,
    )?.shareBasisPoints ?? 0
  const totals = splitRightTypes.map((rightType) => ({
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
          {t('workspace.credits.title')}{' '}
          <span>({release.participantCount})</span>
        </h2>
        {draft && release.participantCount > 0 && (
          <Button
            className="rounded-full"
            onClick={() => onAction({ kind: 'splits' })}
            size="sm"
            variant="outline"
          >
            {t('workspace.credits.editSplits')}
          </Button>
        )}
      </div>
      <p>{t('workspace.credits.description')}</p>
      <ul
        aria-label={t('workspace.credits.totals')}
        className="artist-release-credit-totals"
      >
        {totals.map(({ rightType, total }) => {
          const complete = total === FULL_SHARE_BASIS_POINTS
          return (
            <li data-done={complete} key={rightType}>
              {complete ? (
                <CircleCheck aria-hidden="true" />
              ) : (
                <CircleDashed aria-hidden="true" />
              )}
              {t('workspace.credits.total', {
                right: t(rightTypeLabels[rightType]),
                percent: basisPointsToPercent(total),
              })}
            </li>
          )
        })}
      </ul>
      {release.participants.length === 0 ? (
        <p>
          {t('workspace.credits.none')}
          {draft && ` ${t('workspace.credits.noneHint')}`}
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
                        {t('workspace.credits.needsRole')}
                      </span>
                    )}
                    <p>
                      {person.roles
                        .map((role) => t(participantRoleLabels[role]))
                        .join(' · ') || t('workspace.credits.noRoles')}
                    </p>
                    <p className="artist-release-credit-shares">
                      {splitRightTypes
                        .map(
                          (rightType) =>
                            `${t(rightTypeLabels[rightType])} ${basisPointsToPercent(share(person.id, rightType))}%`,
                        )
                        .join(' · ')}
                    </p>
                    {missingRole && (
                      <p className="artist-release-credit-helper">
                        {t('workspace.credits.assignRole')}
                      </p>
                    )}
                  </div>
                  {draft && (
                    <div className="flex shrink-0 items-center">
                      <Button
                        aria-label={
                          missingRole
                            ? t('workspace.credits.editRolesFor', {
                                name: person.displayName,
                              })
                            : t('workspace.credits.editContributor', {
                                name: person.displayName,
                              })
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
                          t('workspace.credits.editRoles')
                        ) : (
                          <Pencil aria-hidden="true" className="size-4" />
                        )}
                      </Button>
                      <Button
                        aria-label={t(
                          'workspace.credits.removeContributorFor',
                          {
                            name: person.displayName,
                          },
                        )}
                        className="min-h-11 min-w-11"
                        onClick={() =>
                          onAction({
                            kind: 'contributor-remove',
                            contributorId: person.id,
                          })
                        }
                        size="icon"
                        title={t('workspace.credits.removeContributor')}
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
          {t('workspace.credits.partial', {
            shown: release.participants.length,
            total: release.participantCount,
          })}
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
              <UserRoundCheck aria-hidden="true" className="size-4" />
              {t('workspace.credits.self')}
            </Button>
          )}
          <Button
            className="rounded-full"
            onClick={() => onAction({ kind: 'contributor-add' })}
            size="sm"
            variant="outline"
          >
            {t('workspace.credits.add')}
          </Button>
        </div>
      )}
      <p className="artist-release-footnote">
        {t('workspace.credits.footnote')}
      </p>
    </section>
  )
}
