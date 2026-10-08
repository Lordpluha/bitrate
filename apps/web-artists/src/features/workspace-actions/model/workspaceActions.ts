import { createContext, useContext } from 'react'

export type WorkspaceAction =
  | 'search'
  | 'notifications'
  | 'create-release'
  | 'promotion'
  | 'analytics'
  | 'profile'
  | 'settings'
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
      'Audio uploads are coming soon. No file has been uploaded. You can already create a release draft and browse your catalogue.',
  },
  notifications: {
    title: 'Notifications',
    description:
      'The notification center is coming soon. No notifications are available in this workspace yet.',
  },
  promotion: {
    title: 'Promotion',
    description:
      'Promotion tools are coming soon. Campaigns and paid promotion are not available yet.',
  },
  analytics: {
    title: 'Analytics',
    description:
      'Analytics is coming soon. Listening and performance data will appear when a data provider is connected.',
  },
  profile: {
    title: 'Profile',
    description:
      'Artist profile editing is coming soon. Your current account is shown in the workspace menu.',
  },
  settings: {
    title: 'Settings',
    description:
      'Workspace settings are coming soon. You can already change your appearance below.',
  },
  support: {
    title: 'Help & support',
    description:
      'The support center is coming soon. No support request has been sent.',
  },
} as const
