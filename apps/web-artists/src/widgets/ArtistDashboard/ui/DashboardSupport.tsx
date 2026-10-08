import { useWorkspaceActions } from '@features/workspace-actions'

export function DashboardSupport({ onOpen }: { onOpen?: () => void }) {
  const { openAction } = useWorkspaceActions()
  return (
    <button
      className="artist-workspace-support min-h-8 px-3 text-left text-[0.8125rem] font-normal text-text-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => {
        onOpen?.()
        openAction('support')
      }}
      type="button"
    >
      Help & support
    </button>
  )
}
