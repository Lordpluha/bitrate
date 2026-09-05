import { beforeEach, describe, expect, it, vi } from 'vitest'

import { registerStoreReset, resetAllStores } from '@/shared/store/resetStores'

describe('store reset registry', () => {
  beforeEach(() => {
    resetAllStores()
  })

  it('resets every registered store', () => {
    const firstReset = vi.fn()
    const secondReset = vi.fn()

    const unregisterFirst = registerStoreReset({ reset: firstReset })
    const unregisterSecond = registerStoreReset({ reset: secondReset })

    resetAllStores()

    expect(firstReset).toHaveBeenCalledOnce()
    expect(secondReset).toHaveBeenCalledOnce()

    unregisterFirst()
    unregisterSecond()
  })

  it('does not reset an unregistered store', () => {
    const reset = vi.fn()
    const unregister = registerStoreReset({ reset })

    unregister()
    resetAllStores()

    expect(reset).not.toHaveBeenCalled()
  })
})
