import { Button } from '@bitrate/ui-react'
import type { ReleaseWorkspace } from '@entities/release'
import { CircleCheck, CircleDashed } from 'lucide-react'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface WorkspaceRightsProps {
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

function Confirmation({ done, label }: { done: boolean; label: string }) {
  const Icon = done ? CircleCheck : CircleDashed
  return (
    <li data-done={done}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <span className="sr-only">
        {done ? '(confirmed)' : '(not confirmed)'}
      </span>
    </li>
  )
}

/** Who owns the recording and the confirmations review needs, then the optional barcode. */
export function WorkspaceRights({ release, onAction }: WorkspaceRightsProps) {
  const draft = release.status === 'DRAFT'
  const { rights } = release
  const owner =
    rights.masterOwnerType === 'ARTIST'
      ? `${release.artistName} (this artist)`
      : rights.masterOwnerName
  return (
    <section
      aria-labelledby="release-rights-heading"
      className="artist-release-workspace-panel artist-release-rights"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-rights-heading">Rights</h2>
        {draft && (
          <Button
            className="rounded-full"
            onClick={() => onAction({ kind: 'rights' })}
            size="sm"
            variant="outline"
          >
            Edit rights
          </Button>
        )}
      </div>
      <p>Who owns the recording, and that every songwriter is credited.</p>
      <ul className="artist-release-rights-list">
        <Confirmation
          done={owner !== null}
          label={owner ? `Master owner: ${owner}` : 'Master owner not chosen'}
        />
        <Confirmation
          done={rights.writersConfirmedAt !== null}
          label="All songwriters and composers are listed"
        />
      </ul>
      <div className="artist-release-identifiers">
        <h3>
          Identifiers <span>· optional</span>
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            UPC/EAN: <span>{release.upc ?? 'Not provided'}</span>
          </p>
          {draft && (
            <Button
              onClick={() => onAction({ kind: 'upc' })}
              size="sm"
              variant="link"
            >
              Edit UPC
            </Button>
          )}
        </div>
        <p>
          Store barcodes and track ISRCs are optional here; each track's ISRC is
          set in Tracks.
        </p>
      </div>
    </section>
  )
}
