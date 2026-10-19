/** A play this recent is treated as still going: most tracks run three to five minutes. */
const LISTENING_NOW_MS = 5 * 60_000

type ActivityActionInput = {
  listenedAt: Date
  now?: Date
}

/** The verb an Activity Row puts between the listener's name and the track. */
export const getActivityAction = ({
  listenedAt,
  now = new Date(),
}: ActivityActionInput) =>
  now.getTime() - listenedAt.getTime() < LISTENING_NOW_MS
    ? 'is listening to'
    : 'played'
