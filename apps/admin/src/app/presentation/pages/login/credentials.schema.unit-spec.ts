import { describe, expect, it } from 'vitest'
import { credentialsSchema } from './credentials.schema'

describe('credentialsSchema', () => {
  it('accepts an autofilled address with spaces and capitals and normalises it', () => {
    const parsed = credentialsSchema.parse({ email: ' Ops@Bitrate.APP ', password: 'secret' })

    expect(parsed.email).toBe('ops@bitrate.app')
  })

  it('still asks for an address when only spaces were typed', () => {
    const result = credentialsSchema.safeParse({ email: '   ', password: 'secret' })

    expect(result.error?.issues[0]?.message).toBe('login.invalid.emailRequired')
  })
})
