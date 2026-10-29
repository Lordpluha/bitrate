import { describe, expect, it } from 'vitest'
import { BITRATE_PLAYER_TRANSPORT_CONTROLS } from '../../contract'
import { parseControls, resolveChrome } from './controls'

describe('parseControls', () => {
  it('allows every known control when the attribute is absent', () => {
    expect(parseControls(null, BITRATE_PLAYER_TRANSPORT_CONTROLS)).toEqual(
      BITRATE_PLAYER_TRANSPORT_CONTROLS,
    )
  })

  it('keeps the known order whatever order the attribute lists them in', () => {
    expect(parseControls('next  play\tprev', BITRATE_PLAYER_TRANSPORT_CONTROLS)).toEqual([
      'prev',
      'play',
      'next',
    ])
  })

  it('ignores unknown names and allows nothing for an empty attribute', () => {
    expect(parseControls('play rewind', BITRATE_PLAYER_TRANSPORT_CONTROLS)).toEqual(['play'])
    expect(parseControls('', BITRATE_PLAYER_TRANSPORT_CONTROLS)).toEqual([])
  })
})

describe('resolveChrome', () => {
  it('keeps a known layout and falls back to bar otherwise', () => {
    expect(resolveChrome('floating')).toBe('floating')
    expect(resolveChrome('none')).toBe('none')
    expect(resolveChrome('sidebar')).toBe('bar')
    expect(resolveChrome(undefined)).toBe('bar')
  })
})
