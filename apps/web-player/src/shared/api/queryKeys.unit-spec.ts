import { describe, expect, it } from 'vitest'
import { apiQueryKeys } from './queryKeys'

describe('apiQueryKeys.users.follows', () => {
  it('caches pages of different sizes separately', () => {
    expect(apiQueryKeys.users.follows('user-1', 'followers', 20)).not.toEqual(
      apiQueryKeys.users.follows('user-1', 'followers', 50),
    )
  })

  it('stays under the users root so user invalidation reaches it', () => {
    expect(apiQueryKeys.users.follows('user-1', 'following', 20)[0]).toBe(
      apiQueryKeys.users.all[0],
    )
  })
})
