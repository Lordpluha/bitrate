import { describe, expect, it } from '@jest/globals'
import { CreateTrackSchema, UpdateTrackSchema } from './create-track.dto'

describe('CreateTrackSchema', () => {
  it('requires the rights confirmation', () => {
    expect(CreateTrackSchema.safeParse({ title: 'Track title' }).success).toBe(false)
    expect(
      CreateTrackSchema.safeParse({ title: 'Track title', rightsConfirmed: 'false' }).success,
    ).toBe(false)
  })

  it('accepts the multipart text form of the confirmation', () => {
    const result = CreateTrackSchema.parse({ title: 'Track title', rightsConfirmed: 'true' })

    expect(result).toEqual({ title: 'Track title', rightsConfirmed: true })
  })
})

describe('UpdateTrackSchema', () => {
  it('does not require a confirmation for a metadata-only update', () => {
    expect(UpdateTrackSchema.parse({ title: 'Updated title' })).toEqual({ title: 'Updated title' })
  })

  it('still refuses a confirmation that is not true', () => {
    expect(
      UpdateTrackSchema.safeParse({ title: 'Updated title', rightsConfirmed: 'no' }).success,
    ).toBe(false)
  })
})
