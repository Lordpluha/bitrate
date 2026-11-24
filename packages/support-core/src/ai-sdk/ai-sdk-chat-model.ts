import type { LanguageModelV4 } from '@ai-sdk/provider'
import { isStepCount, streamText } from 'ai'
import type { ChatModel, ChatStepEvent, ChatStepInput } from '../ports.js'
import type { ChatModelOptions } from './chat-model-options.js'
import { parseModelId } from './parse-model-id.js'
import { SupportModelError } from './support-model-error.js'
import { toAiMessage } from './to-ai-message.js'
import { toProviderOptions } from './to-provider-options.js'
import { toToolSet } from './to-tool-set.js'

/** Wraps an AI SDK language model as a one-step `ChatModel`; the agent runs the tool loop. */
export function aiSdkChatModel(
  model: LanguageModelV4,
  id: string,
  options: ChatModelOptions = {},
): ChatModel {
  const { provider, modelId } = parseModelId(id)
  const providerOptions = toProviderOptions(provider, options)
  return {
    provider,
    modelId,
    async *step(input: ChatStepInput, signal?: AbortSignal): AsyncIterable<ChatStepEvent> {
      const result = streamText({
        model,
        system: input.system,
        messages: input.messages.map(toAiMessage),
        tools: toToolSet(input.tools),
        toolChoice: input.toolChoice,
        stopWhen: isStepCount(1),
        // The default handler prints the error, which may quote model output, to the console.
        // The error part below rethrows it instead, and the host decides what to log.
        onError: () => {},
        ...(signal ? { abortSignal: signal } : {}),
        ...(providerOptions ? { providerOptions } : {}),
      })
      for await (const part of result.stream) {
        if (part.type === 'text-delta') {
          if (part.text !== '') yield { type: 'text-delta', text: part.text }
        } else if (part.type === 'tool-call') {
          yield {
            type: 'tool-call',
            call: { id: part.toolCallId, name: part.toolName, input: part.input },
          }
        } else if (part.type === 'finish') {
          yield {
            type: 'finish',
            usage: {
              inputTokens: part.totalUsage.inputTokens ?? 0,
              outputTokens: part.totalUsage.outputTokens ?? 0,
            },
          }
        } else if (part.type === 'error') {
          throw new SupportModelError(`Model ${id} failed`, { cause: part.error })
        }
      }
    },
  }
}
