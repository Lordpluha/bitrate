/**
 * What the CMAF engine takes from its host instead of reaching for globals: where to keep the
 * remembered bandwidth and the debug switch, and whether tracing is on by default. The engine
 * stays framework- and app-free; the host calls `configureCmafEngine` once at start-up.
 */

/** The slice of the Web Storage API the engine reads and writes. */
export type CmafStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export type CmafEngineEnvironment = {
  /** Where throughput and the `player-debug` switch persist; `null` keeps nothing. */
  storage: CmafStorage | null
  /** Tracing when `player-debug` is unset — a host turns this on in development. */
  debugByDefault: boolean
}

let environment: CmafEngineEnvironment = { storage: null, debugByDefault: false }

/** Sets the host's storage and debug default; fields left out keep their current value. */
export function configureCmafEngine(next: Partial<CmafEngineEnvironment>): void {
  environment = { ...environment, ...next }
}

/** The environment the engine currently runs with. */
export function getCmafEngineEnvironment(): CmafEngineEnvironment {
  return environment
}
