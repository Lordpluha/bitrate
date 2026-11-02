import type { TranslationKey } from '@shared/i18n'
import { createContext, useContext } from 'react'

export type WorkspaceAction =
  | 'search'
  | 'notifications'
  | 'create-release'
  | 'promotion'
  | 'support'
  | 'account'
  | 'upload-track'

export const WorkspaceActionsContext = createContext<{
  openAction: (action: WorkspaceAction) => void
} | null>(null)

export function useWorkspaceActions() {
  const context = useContext(WorkspaceActionsContext)
  if (!context) throw new Error('WorkspaceActionsProvider is required')
  return context
}

/** Catalog keys for the dialogs of actions that only explain themselves. */
export const workspaceNotices = {
  'upload-track': {
    title: 'music.uploadTrack',
    description: 'music.actions.uploadTrack',
  },
  notifications: {
    title: 'shell.notifications',
    description: 'music.actions.notifications',
  },
  promotion: {
    title: 'shell.nav.promotion',
    description: 'music.actions.promotion',
  },
  support: {
    title: 'shell.support',
    description: 'music.actions.support',
  },
} as const satisfies Record<
  string,
  { title: TranslationKey; description: TranslationKey }
>
