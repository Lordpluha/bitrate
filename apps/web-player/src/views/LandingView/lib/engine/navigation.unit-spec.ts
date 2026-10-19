import { describe, expect, it } from 'vitest'
import { formatSceneNumber, sceneFromHash, targetScene } from './navigation'

const IDS = ['hero', 'loop', 'library', 'cta']

describe('sceneFromHash', () => {
  it('opens the scene a deep link names', () => {
    expect(sceneFromHash({ hash: '#library', ids: IDS })).toBe(2)
  })

  it('falls back to the first scene for an empty or unknown hash', () => {
    expect(sceneFromHash({ hash: '', ids: IDS })).toBe(0)
    expect(sceneFromHash({ hash: '#plans', ids: IDS })).toBe(0)
  })
})

describe('targetScene', () => {
  it('steps forward and back with the scene keys', () => {
    expect(targetScene({ key: 'ArrowDown', index: 1, count: 4 })).toBe(2)
    expect(targetScene({ key: 'PageDown', index: 1, count: 4 })).toBe(2)
    expect(targetScene({ key: ' ', index: 1, count: 4 })).toBe(2)
    expect(targetScene({ key: 'ArrowUp', index: 1, count: 4 })).toBe(0)
    expect(targetScene({ key: 'PageUp', index: 1, count: 4 })).toBe(0)
  })

  it('jumps to the ends with Home and End', () => {
    expect(targetScene({ key: 'Home', index: 2, count: 4 })).toBe(0)
    expect(targetScene({ key: 'End', index: 0, count: 4 })).toBe(3)
  })

  it('stays inside the scene list', () => {
    expect(targetScene({ key: 'ArrowDown', index: 3, count: 4 })).toBe(3)
    expect(targetScene({ key: 'ArrowUp', index: 0, count: 4 })).toBe(0)
  })

  it('ignores other keys', () => {
    expect(targetScene({ key: 'a', index: 1, count: 4 })).toBeNull()
  })
})

describe('formatSceneNumber', () => {
  it('pads the counter to two digits', () => {
    expect(formatSceneNumber(1)).toBe('01')
    expect(formatSceneNumber(11)).toBe('11')
  })
})
