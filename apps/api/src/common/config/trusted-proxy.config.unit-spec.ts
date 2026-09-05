import { describe, expect, it } from '@jest/globals'
import { resolveTrustProxySetting } from './trusted-proxy.config'

describe('resolveTrustProxySetting', () => {
  it('does not trust client-supplied forwarding headers by default', () => {
    expect(resolveTrustProxySetting(0)).toBe(false)
  })

  it('returns the explicitly configured proxy hop count', () => {
    expect(resolveTrustProxySetting(1)).toBe(1)
    expect(resolveTrustProxySetting(2)).toBe(2)
  })
})
