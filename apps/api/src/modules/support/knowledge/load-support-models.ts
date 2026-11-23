/** The AI SDK adapters of the support core (ESM, loaded on first use like `loadSupportCore`). */
export function loadSupportModels() {
  return import('@bitrate/support-core/ai-sdk')
}
