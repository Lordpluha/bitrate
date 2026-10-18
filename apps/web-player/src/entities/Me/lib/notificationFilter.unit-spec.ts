import { describe, expect, it } from 'vitest'
import { filterNotifications } from './notificationFilter'

const note = (
  id: string,
  type: 'FOLLOW' | 'NEW_RELEASE' | 'PLAYLIST_UPDATE' | 'SYSTEM',
) => ({ id, type })
const notifications = [
  note('n1', 'FOLLOW'),
  note('n2', 'NEW_RELEASE'),
  note('n3', 'PLAYLIST_UPDATE'),
  note('n4', 'SYSTEM'),
  note('n5', 'FOLLOW'),
]

describe('filterNotifications', () => {
  it('keeps everything on All', () => {
    expect(filterNotifications({ filter: 'all', notifications })).toHaveLength(
      5,
    )
  })

  it.each([
    ['followers', ['n1', 'n5']],
    ['releases', ['n2']],
    ['playlists', ['n3']],
    ['events', ['n4']],
  ] as const)('keeps only %s', (filter, ids) => {
    expect(
      filterNotifications({ filter, notifications }).map((item) => item.id),
    ).toEqual(ids)
  })
})
