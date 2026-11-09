import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import type { useCreateReleaseAction } from '../model/useCreateReleaseAction'

export function CreateReleaseFeedback({
  action,
}: {
  action: ReturnType<typeof useCreateReleaseAction>
}) {
  const { t, tMessage } = useI18n()
  if (!action.error && !action.navigationFailed) return null
  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-sm space-y-3 rounded-xl border border-destructive/40 bg-card p-4 text-sm shadow-lg"
      role="alert"
    >
      <Button
        aria-label={t('common.dismissNotice')}
        className="float-right"
        onClick={action.dismiss}
        size="icon"
        variant="ghost"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
      <p>
        {action.navigationFailed
          ? t('music.create.openFailed')
          : tMessage(action.error?.message)}
      </p>
      <div className="flex flex-wrap gap-3">
        {action.navigationFailed && (
          <Button
            disabled={action.pending}
            onClick={() => void action.create()}
            size="sm"
            variant="outline"
          >
            {t('music.create.open')}
          </Button>
        )}
        <Link
          className="underline underline-offset-4"
          search={{ tab: 'releases', page: 1 }}
          to="/dashboard/music"
        >
          {t('music.create.checkMusic')}
        </Link>
      </div>
    </div>
  )
}
