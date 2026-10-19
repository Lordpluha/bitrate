type NotificationType =
  | 'FOLLOW'
  | 'FRIEND_ACCEPTED'
  | 'FRIEND_REQUEST'
  | 'NEW_RELEASE'
  | 'PLAYLIST_UPDATE'
  | 'SYSTEM'

/** The notifications page's chips. */
export type NotificationFilter =
  | 'all'
  | 'events'
  | 'followers'
  | 'friends'
  | 'playlists'
  | 'releases'

const TYPES_BY_FILTER: Record<
  Exclude<NotificationFilter, 'all'>,
  readonly NotificationType[]
> = {
  events: ['SYSTEM'],
  followers: ['FOLLOW'],
  friends: ['FRIEND_REQUEST', 'FRIEND_ACCEPTED'],
  playlists: ['PLAYLIST_UPDATE'],
  releases: ['NEW_RELEASE'],
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
    : notifications.filter(({ type }) => TYPES_BY_FILTER[filter].includes(type))
