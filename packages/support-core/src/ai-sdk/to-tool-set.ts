import { jsonSchema, type ToolSet, tool } from 'ai'
import type { ToolSpec } from '../ports.js'

/** Tool definitions without `execute`: the SDK reports calls and the agent runs them. */
export function toToolSet(specs: readonly ToolSpec[]): ToolSet {
  const tools: ToolSet = {}
  for (const spec of specs) {
    tools[spec.name] = tool({
      description: spec.description,
      inputSchema: jsonSchema(spec.inputSchema),
    })
  }
  return tools
}
