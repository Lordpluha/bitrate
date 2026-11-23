import type { ToolSpec } from '../ports.js'

export const SEARCH_TOOL = 'search_knowledge'
export const HANDOFF_TOOL = 'handoff_to_operator'

export const SUPPORT_TOOLS: readonly ToolSpec[] = [
  {
    name: SEARCH_TOOL,
    description:
      'Search Bitrate help articles and policies. Call it before answering any question about Bitrate.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'A short search query that restates the user question.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: HANDOFF_TOOL,
    description:
      'Hand the conversation to a human on the Bitrate team. Use it when the user asks for a person, when the articles do not answer the question, or when the request needs access to the user account.',
    inputSchema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'One sentence for the operator: what the user needs.',
        },
      },
      required: ['reason'],
      additionalProperties: false,
    },
  },
]
