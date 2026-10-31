import { Button } from '@bitrate/ui-react'
import type { ReleaseWorkspace } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { CircleCheck, CircleDashed } from 'lucide-react'
import type { WorkspaceActionHandler } from '../model/workspaceAction'

interface WorkspaceRightsProps {
  release: ReleaseWorkspace
  onAction: WorkspaceActionHandler
}

function Confirmation({ done, label }: { done: boolean; label: string }) {
  const Icon = done ? CircleCheck : CircleDashed
  const { t } = useI18n()
  return (
    <li data-done={done}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <span className="sr-only">
        {done
          ? t('workspace.rights.confirmed')
          : t('workspace.rights.notConfirmed')}
      </span>
    </li>
  )
}

/** Who owns the recording, then the optional barcode. */
export function WorkspaceRights({ release, onAction }: WorkspaceRightsProps) {
  const draft = release.status === 'DRAFT'
  const { t } = useI18n()
  const { rights } = release
  const owner =
    rights.masterOwnerType === 'ARTIST'
      ? t('workspace.rights.thisArtist', { name: release.artistName })
      : rights.masterOwnerName
  return (
    <section
      aria-labelledby="release-rights-heading"
      className="artist-release-workspace-panel artist-release-rights"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-rights-heading">{t('workspace.rights.title')}</h2>
        {draft && (
          <Button
            className="rounded-full"
            onClick={() => onAction({ kind: 'rights' })}
            size="sm"
            variant="outline"
          >
            {t('workspace.rights.edit')}
          </Button>
        )}
      </div>
      <p>{t('workspace.rights.description')}</p>
      <ul className="artist-release-rights-list">
        <Confirmation
          done={owner !== null}
          label={
            owner
              ? t('workspace.rights.masterOwner', { owner })
              : t('workspace.rights.noMasterOwner')
          }
        />
      </ul>
      <div className="artist-release-identifiers">
        <h3>
          {t('workspace.rights.identifiers')}{' '}
          <span>{t('workspace.rights.optional')}</span>
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            {t('workspace.rights.upc')}{' '}
            <span>{release.upc ?? t('workspace.rights.notProvided')}</span>
          </p>
          {draft && (
            <Button
              onClick={() => onAction({ kind: 'upc' })}
              size="sm"
              variant="link"
            >
              {t('workspace.rights.editUpc')}
            </Button>
          )}
        </div>
        <p>{t('workspace.rights.identifiersNote')}</p>
      </div>
    </section>
  )
}
