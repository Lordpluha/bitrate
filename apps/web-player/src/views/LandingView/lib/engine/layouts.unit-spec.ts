import { describe, expect, it } from 'vitest'
import { LANDING_SCENES } from '../../model/scenes'
import { createLayouts } from './layouts'
import { LOOK } from './stage/looks'

describe('landing stage per-scene tables', () => {
  it('has exactly one particle layout and one look per scene', () => {
    expect(createLayouts()).toHaveLength(LANDING_SCENES.length)
    expect(LOOK).toHaveLength(LANDING_SCENES.length)
  })
})
