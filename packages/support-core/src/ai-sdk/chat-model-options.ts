/** How much a reasoning model thinks before answering; lower is cheaper and faster. */
export type ReasoningEffort = 'low' | 'medium' | 'high'

/** Per-model settings chosen by the host, e.g. a low effort for short support answers. */
export interface ChatModelOptions {
  effort?: ReasoningEffort
}
