/**
 * `@bitrate/support-core` is ESM. The CommonJS API loads it on first use, the same way the
 * transcode pipeline loads `@bitrate/converter`; unit tests mock this module instead.
 */
export function loadSupportCore() {
  return import('@bitrate/support-core')
}

export type SupportCore = Awaited<ReturnType<typeof loadSupportCore>>
