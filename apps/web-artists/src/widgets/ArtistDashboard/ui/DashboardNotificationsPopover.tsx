import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@bitrate/ui-react'
import { useNotifications } from '@entities/notification'
import { useI18n } from '@shared/i18n'
import { Bell, X } from 'lucide-react'
import { useId, useState } from 'react'
import { DashboardNotifications } from './DashboardNotifications'

export function DashboardNotificationsPopover({
  artistId,
}: {
  artistId: string
}) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const { t } = useI18n()
  const unread = useNotifications(artistId).data?.unread ?? 0

  return (
    <Popover modal={false} onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={
            unread > 0
              ? t('shell.notifications.label', { count: unread })
              : t('shell.notifications')
          }
          className="artist-workspace-bell relative size-11 shrink-0 rounded-lg bg-secondary text-text-secondary"
          size="icon"
          variant="ghost"
        >
          <Bell aria-hidden="true" className="size-5" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 size-2 rounded-full bg-accent"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-labelledby={titleId}
        className="artist-dashboard artist-notifications-popover"
        positionerClassName="z-50"
        sideOffset={12}
      >
        <div className="artist-notifications-header">
          <span
            aria-hidden="true"
            className="artist-notifications-heading-icon"
          >
            <Bell className="size-4" />
          </span>
          <h2 className="min-w-0 flex-1 text-sm font-semibold" id={titleId}>
            {t('shell.notifications')}
          </h2>
          <Button
            aria-label={t('common.closeDialog')}
            className="size-8 rounded-full text-text-secondary"
            onClick={() => setOpen(false)}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <DashboardNotifications
          artistId={artistId}
          onNavigate={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
