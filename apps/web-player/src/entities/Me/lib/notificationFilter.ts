type NotificationType = 'FOLLOW' | 'NEW_RELEASE' | 'PLAYLIST_UPDATE' | 'SYSTEM'

/** The notifications page's chips. */
export type NotificationFilter =
  | 'all'
  | 'events'
  | 'followers'
  | 'playlists'
  | 'releases'

const TYPE_BY_FILTER: Record<
  Exclude<NotificationFilter, 'all'>,
  NotificationType
> = {
  events: 'SYSTEM',
  followers: 'FOLLOW',
  playlists: 'PLAYLIST_UPDATE',
  releases: 'NEW_RELEASE',
}

type FilterNotificationsInput<
  TNotification extends { type: NotificationType },
> = {
  filter: NotificationFilter
  notifications: TNotification[]
}

/** Keeps the notifications a chip stands for; All keeps every one. */
export const filterNotifications = <
  TNotification extends { type: NotificationType },
>({
  filter,
  notifications,
}: FilterNotificationsInput<TNotification>): TNotification[] =>
  filter === 'all'
    ? notifications
    : notifications.filter(({ type }) => type === TYPE_BY_FILTER[filter])
