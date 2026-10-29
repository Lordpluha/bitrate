import { useWorkspaceActions } from '@features/workspace-actions'
import { useI18n } from '@shared/i18n'

export function DashboardSupport({ onOpen }: { onOpen?: () => void }) {
  const { openAction } = useWorkspaceActions()
  const { t } = useI18n()
  return (
    <button
      className="artist-workspace-support min-h-8 px-3 text-left text-[0.8125rem] font-normal text-text-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => {
        onOpen?.()
        openAction('support')
      }}
      type="button"
    >
      {t('shell.support')}
    </button>
  )
}
