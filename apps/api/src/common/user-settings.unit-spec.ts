import { beforeEach, describe, expect, it } from '@jest/globals'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { readUserSettings } from './user-settings'

describe('readUserSettings', () => {
  beforeEach(() => resetPrismaMock())

  it('returns the saved settings', async () => {
    const saved = {
      explicitContent: false,
      privateSession: true,
      showListeningActivity: false,
      followersVisible: false,
      publicPlaylistsOnProfile: false,
    }
    prismaMock.userSettings.findUnique.mockResolvedValue(saved as never)

    await expect(readUserSettings(prismaMock, 'user-1')).resolves.toEqual(saved)
  })

  it('falls back to open defaults for a user who never saved settings', async () => {
    prismaMock.userSettings.findUnique.mockResolvedValue(null)

    await expect(readUserSettings(prismaMock, 'user-1')).resolves.toEqual({
      explicitContent: true,
      privateSession: false,
      showListeningActivity: true,
      followersVisible: true,
      publicPlaylistsOnProfile: true,
    })
  })
})
