import type { Translate } from '@shared/i18n'

/** A play this recent is treated as still going: most tracks run three to five minutes. */
const LISTENING_NOW_MS = 5 * 60_000

type ActivityActionInput = {
  listenedAt: Date
  now?: Date
  t: Translate
}

/** The verb an Activity Row puts between the listener's name and the track. */
export const getActivityAction = ({
  listenedAt,
  now = new Date(),
  t,
}: ActivityActionInput) =>
  now.getTime() - listenedAt.getTime() < LISTENING_NOW_MS
    ? t('activity.listeningTo')
    : t('activity.played')
