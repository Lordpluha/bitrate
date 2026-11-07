import { Button, cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { Plus } from 'lucide-react'
import { useWorkspaceActions } from '../model/workspaceActions'

export function CreateReleaseButton({
  first = false,
  className,
}: {
  first?: boolean
  className?: string
}) {
  const { openAction, creatingRelease } = useWorkspaceActions()
  const { t } = useI18n()
  return (
    <Button
      aria-busy={creatingRelease}
      className={cn(
        'artist-workspace-primary h-11 gap-[0.5625rem] rounded-full px-[1.125rem] text-sm font-semibold',
        className,
      )}
      disabled={creatingRelease}
      onClick={() => openAction('create-release')}
      variant="primary"
    >
      <Plus aria-hidden="true" className="size-[1.0625rem]" />
      {creatingRelease
        ? t('music.create.submitting')
        : first
          ? t('music.create.first')
          : t('music.create.title')}
    </Button>
  )
}
