import { Button } from '@bitrate/ui-react'
import {
  type NotificationCategory,
  notificationCategories,
  notificationCategoryLabels,
  useNotificationPreferences,
  useSaveNotificationPreferences,
} from '@entities/notification'
import { useId } from 'react'

interface NotificationPreferencesProps {
  artistId: string
}

/** Per-category channels; only in-app exists today, so email and push say so plainly. */
export function NotificationPreferences({
  artistId,
}: NotificationPreferencesProps) {
  const id = useId()
  const preferences = useNotificationPreferences(artistId)
  const save = useSaveNotificationPreferences(artistId)

  if (preferences.isPending)
    return (
      <p className="text-sm" role="status">
        Loading notification settings…
      </p>
    )
  if (preferences.isError)
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-destructive" role="alert">
          {preferences.error.message}
        </p>
        <Button
          onClick={() => {
            void preferences.refetch()
          }}
          size="sm"
          variant="outline"
        >
          Try again
        </Button>
      </div>
    )

  const muted = new Set(
    save.variables?.mutedInApp ?? preferences.data.mutedInApp,
  )
  const toggle = (category: NotificationCategory, on: boolean) => {
    const next = notificationCategories.filter((item) =>
      item === category ? !on : muted.has(item),
    )
    save.mutate({ mutedInApp: next })
  }

  return (
    <div className="space-y-3">
      <table className="w-full text-sm">
        <caption className="sr-only">Notification channels by category</caption>
        <thead>
          <tr className="text-left text-xs text-text-secondary">
            <th className="py-1 font-normal" scope="col">
              Category
            </th>
            <th className="py-1 text-center font-normal" scope="col">
              In-app
            </th>
            <th className="py-1 text-center font-normal" scope="col">
              Email
            </th>
            <th className="py-1 text-center font-normal" scope="col">
              Push
            </th>
          </tr>
        </thead>
        <tbody>
          {notificationCategories.map((category) => {
            const label = notificationCategoryLabels[category]
            const inputId = `${id}-${category}`
            return (
              <tr className="border-t border-border" key={category}>
                <th className="py-3 pr-3 text-left font-normal" scope="row">
                  <label className="block" htmlFor={inputId}>
                    {label.title}
                  </label>
                  <span className="block text-xs text-text-secondary">
                    {label.hint}
                  </span>
                </th>
                <td className="py-3 text-center">
                  <input
                    checked={!muted.has(category)}
                    className="size-4 accent-primary"
                    disabled={save.isPending}
                    id={inputId}
                    onChange={(event) => toggle(category, event.target.checked)}
                    type="checkbox"
                  />
                </td>
                <td className="py-3 text-center text-xs text-text-secondary">
                  Not sent yet
                </td>
                <td className="py-3 text-center text-xs text-text-secondary">
                  Not sent yet
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-text-secondary" role="status">
        {save.isPending
          ? 'Saving…'
          : 'Switched-off categories leave the notification center. Anything that needs action still shows on your dashboard. Account and security emails are always sent.'}
      </p>
      {save.error && (
        <p className="text-sm text-destructive" role="alert">
          {save.error.message}
        </p>
      )}
    </div>
  )
}
