import { Button } from '@bitrate/ui-react'
import { participantRoleLabels, type ReleaseWorkspace } from '@entities/release'
import { CircleAlert, Pencil } from 'lucide-react'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface WorkspaceParticipantsProps {
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

export function WorkspaceParticipants({
  release,
  onAction,
}: WorkspaceParticipantsProps) {
  const draft = release.status === 'DRAFT'
  return (
    <section
      aria-labelledby="release-participants-heading"
      className="artist-release-workspace-panel artist-release-participants"
    >
      <h2 id="release-participants-heading">
        Participants <span>({release.participantCount})</span>
      </h2>
      {draft && (
        <Button
          className="my-3 rounded-full"
          onClick={() => onAction({ kind: 'contributor-add' })}
          size="sm"
          variant="outline"
        >
          Add contributor
        </Button>
      )}
      {release.participants.length === 0 ? (
        <p>No credited participants yet.</p>
      ) : (
        <ul>
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
                    {missingRole && (
                      <p className="artist-release-credit-helper">
                        Assign at least one role.
                      </p>
                    )}
                  </div>
                  {draft && (
                    <Button
                      aria-label={
                        missingRole
                          ? `Edit roles for ${person.displayName}`
                          : `Edit contributor ${person.displayName}`
                      }
                      className="min-h-11 min-w-11 shrink-0"
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
      <p className="artist-release-footnote">
        Credits do not grant workspace access. Rights and revenue splits are
        coming soon.
      </p>
    </section>
  )
}
