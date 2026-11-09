import { describe, expect, it } from 'vitest'
import { resolveLibraryHref } from './resolveLibraryHref'

describe('resolveLibraryHref', () => {
  it('links a followed artist to their page by username', () => {
    expect(
      resolveLibraryHref({ id: 'ar1', title: 'Luma Vale', type: 'artist' }),
    ).toBe('/main/artist/Luma%20Vale')
  })

  it('links a playlist to its page by id', () => {
    expect(
      resolveLibraryHref({ id: 'p1', title: 'Late Night', type: 'playlist' }),
    ).toBe('/main/playlist/p1')
  })
})
