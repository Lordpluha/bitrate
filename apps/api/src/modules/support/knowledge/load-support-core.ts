/**
 * `@bitrate/support-core` is ESM. The CommonJS API loads it on first use, the same way the
 * transcode pipeline loads `@bitrate/converter`; unit tests mock this module instead.
 * The return type is spelled out: inferred, it names package-internal types that the API's
 * declaration emit cannot reference (TS4058).
 */
export function loadSupportCore(): Promise<typeof import('@bitrate/support-core')> {
  return import('@bitrate/support-core')
}
