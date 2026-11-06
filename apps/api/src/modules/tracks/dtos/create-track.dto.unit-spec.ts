import { describe, expect, it } from '@jest/globals'
import { CreateTrackSchema } from './create-track.dto'

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
