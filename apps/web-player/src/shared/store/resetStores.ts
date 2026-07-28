export type StoreReset = () => void

export type RegisterStoreResetInput = {
  reset: StoreReset
}

const storeResets = new Set<StoreReset>()

/** Registers an auth-bound store reset and returns its unregister callback. */
export function registerStoreReset({
  reset,
}: RegisterStoreResetInput): StoreReset {
  storeResets.add(reset)

  return () => storeResets.delete(reset)
}

/** Resets every registered auth-bound client store. */
export function resetAllStores(): void {
  for (const reset of storeResets) {
    reset()
  }
}
