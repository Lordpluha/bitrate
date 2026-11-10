import { describe, expect, it } from 'vitest'
import { LANDING_SCENES } from '../../model/scenes'
import { createLayouts } from './layouts'
import { LOOK } from './stage/looks'

describe('landing stage per-scene tables', () => {
  it('has exactly one particle layout and one look per scene', () => {
    const ids = LANDING_SCENES.map(({ id }) => id).sort()
    expect(Object.keys(createLayouts()).sort()).toEqual(ids)
    expect(Object.keys(LOOK).sort()).toEqual(ids)
  })
})
