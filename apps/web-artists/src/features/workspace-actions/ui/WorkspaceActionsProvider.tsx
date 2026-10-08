import { Button } from '@bitrate/ui-react'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { type ReactNode, useEffect, useState } from 'react'
import {
  type WorkspaceAction,
  WorkspaceActionsContext,
  workspaceNotices,
} from '../model/workspaceActions'
import { type WorkspaceDestination, WorkspaceSearch } from './WorkspaceSearch'

export function WorkspaceActionsProvider({
  children,
  destinations,
  accountContent,
  appearanceContent,
  createReleaseDialog,
}: {
  children: ReactNode
  destinations: readonly WorkspaceDestination[]
  accountContent: ReactNode
  appearanceContent: ReactNode
  createReleaseDialog: (onClose: () => void) => ReactNode
}) {
  const [action, setAction] = useState<WorkspaceAction | null>(null)

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
      ? 'Search workspace'
      : action === 'account'
        ? 'Artist account'
        : action === 'create-release'
          ? 'Create release'
          : action
            ? workspaceNotices[action].title
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
                  destinations={destinations}
                  onNavigate={close}
                />
              ) : action === 'account' ? (
                <div className="space-y-6">
                  {accountContent}
                  {appearanceContent}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm font-medium text-accent">Coming soon</p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {workspaceNotices[action].description}
                  </p>
                  {action === 'settings' && appearanceContent}
                  <Button
                    className="artist-workspace-primary"
                    onClick={close}
                    variant="primary"
                  >
                    Got it
                  </Button>
                </div>
              )}
            </WorkspaceModal>
          )}
    </WorkspaceActionsContext.Provider>
  )
}
