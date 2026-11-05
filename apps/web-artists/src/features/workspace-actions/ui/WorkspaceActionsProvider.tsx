import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { type ReactNode, useEffect, useState } from 'react'
import {
  type WorkspaceAction,
  WorkspaceActionsContext,
  workspaceNotices,
} from '../model/workspaceActions'
import { type WorkspaceDestination, WorkspaceSearch } from './WorkspaceSearch'

export function WorkspaceActionsProvider({
  artistId,
  children,
  destinations,
  accountContent,
  createReleaseDialog,
  notificationsContent,
}: {
  artistId: string
  children: ReactNode
  destinations: readonly WorkspaceDestination[]
  accountContent: (onNavigate: () => void) => ReactNode
  createReleaseDialog: (onClose: () => void) => ReactNode
  notificationsContent: (onNavigate: () => void) => ReactNode
}) {
  const [action, setAction] = useState<WorkspaceAction | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setAction('search')
      }
    }
    window.addEventListener('keydown', openSearch)
    return () => window.removeEventListener('keydown', openSearch)
  }, [])

  const close = () => setAction(null)
  const title =
    action === 'search'
      ? t('shell.search')
      : action === 'account'
        ? t('shell.artistAccount')
        : action === 'create-release'
          ? t('music.create.title')
          : action
            ? t(workspaceNotices[action].title)
            : ''

  return (
    <WorkspaceActionsContext.Provider value={{ openAction: setAction }}>
      {children}
      {action === 'create-release'
        ? createReleaseDialog(close)
        : action && (
            <WorkspaceModal key={action} onClose={close} title={title}>
              {action === 'search' ? (
                <WorkspaceSearch
                  artistId={artistId}
                  destinations={destinations}
                  onNavigate={close}
                />
              ) : action === 'notifications' ? (
                notificationsContent(close)
              ) : action === 'account' ? (
                <div className="space-y-6">{accountContent(close)}</div>
              ) : (
                <div className="space-y-6">
                  {action !== 'upload-track' && (
                    <p className="text-sm font-medium text-accent">
                      {t('music.actions.comingSoon')}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {t(workspaceNotices[action].description)}
                  </p>
                  <Button
                    className="artist-workspace-primary"
                    onClick={close}
                    variant="primary"
                  >
                    {t('music.actions.gotIt')}
                  </Button>
                </div>
              )}
            </WorkspaceModal>
          )}
    </WorkspaceActionsContext.Provider>
  )
}
