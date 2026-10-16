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

export const workspaceNotices = {
  'upload-track': {
    title: 'Upload track',
    description:
      'Tracks are uploaded inside a release. Create a release, or open one from Music, then use Upload track in its workspace.',
  },
  notifications: {
    title: 'Notifications',
    description: 'Deadlines, review results and delivery updates.',
  },
  promotion: {
    title: 'Promotion',
    description:
      'Promotion tools are coming soon. Campaigns and paid promotion are not available yet.',
  },
  support: {
    title: 'Help & support',
    description:
      'The support center is coming soon. No support request has been sent.',
  },
} as const
