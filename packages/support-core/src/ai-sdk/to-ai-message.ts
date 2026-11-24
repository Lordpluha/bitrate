import type { ModelMessage as AiModelMessage } from 'ai'
import type { ModelMessage } from '../ports.js'

/** The core's model message → the AI SDK's, with tool calls and results as typed parts. */
export function toAiMessage(message: ModelMessage): AiModelMessage {
  switch (message.role) {
    case 'user':
      return { role: 'user', content: message.content }
    case 'assistant':
      if (!message.toolCalls?.length) return { role: 'assistant', content: message.content }
      return {
        role: 'assistant',
        content: [
          ...(message.content === '' ? [] : [{ type: 'text' as const, text: message.content }]),
          ...message.toolCalls.map((call) => ({
            type: 'tool-call' as const,
            toolCallId: call.id,
            toolName: call.name,
            input: call.input,
          })),
        ],
      }
    case 'tool':
      return {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: message.toolCallId,
            toolName: message.toolName,
            output: { type: 'text', value: message.content },
          },
        ],
      }
  }
}
