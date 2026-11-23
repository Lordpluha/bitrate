/**
 * Vercel AI SDK implementations of the core's model ports (ADR-0074). Kept behind the
 * `@bitrate/support-core/ai-sdk` entry so the core itself depends on no model SDK.
 */
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import type { EmbeddingModelV4, LanguageModelV4, ProviderV4 } from '@ai-sdk/provider'
import {
  type ModelMessage as AiModelMessage,
  embedMany,
  isStepCount,
  jsonSchema,
  streamText,
  type ToolSet,
  tool,
} from 'ai'
import type {
  ChatModel,
  ChatStepEvent,
  ChatStepInput,
  Embedder,
  ModelMessage,
  ToolSpec,
} from '../ports.js'

/** A model call failed at the provider (network, overload, refusal of the request). */
export class SupportModelError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'SupportModelError'
  }
}

/** A model id from configuration cannot be resolved; raised at startup, not per message. */
export class SupportModelConfigError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'SupportModelConfigError'
  }
}

/** `provider:model`, as in `SUPPORT_CHAT_MODEL=anthropic:claude-haiku-5-5`. */
interface ParsedModelId {
  provider: string
  modelId: string
}

function parseModelId(id: string): ParsedModelId {
  const separator = id.indexOf(':')
  const provider = id.slice(0, separator)
  const modelId = id.slice(separator + 1).trim()
  if (separator <= 0 || modelId === '') {
    throw new SupportModelConfigError(`Model id "${id}" must look like "provider:model"`)
  }
  return { provider, modelId }
}

/** Wraps an AI SDK language model as one-step `ChatModel`; the agent runs the tool loop. */
export function aiSdkChatModel(model: LanguageModelV4, id: string): ChatModel {
  const { provider, modelId } = parseModelId(id)
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

export function aiSdkEmbedder(model: EmbeddingModelV4, id: string): Embedder {
  const { provider, modelId } = parseModelId(id)
  return {
    provider,
    modelId,
    async embed(texts, signal) {
      try {
        const result = await embedMany({
          model,
          values: [...texts],
          ...(signal ? { abortSignal: signal } : {}),
        })
        return result.embeddings
      } catch (error: unknown) {
        throw new SupportModelError(`Embedding model ${id} failed`, { cause: error })
      }
    },
  }
}

export interface SupportModelKeys {
  anthropicApiKey?: string
  openaiApiKey?: string
}

export interface SupportModels {
  chatModel(id: string): ChatModel
  embedder(id: string): Embedder
}

const KNOWN_PROVIDERS = ['anthropic', 'openai'] as const

/**
 * Resolves `provider:model` ids from configuration to ports. A provider is available only
 * when its API key is set, so a typo or a missing key fails at startup.
 */
export function createSupportModels(keys: SupportModelKeys): SupportModels {
  const providers = new Map<string, ProviderV4>()
  if (keys.anthropicApiKey)
    providers.set('anthropic', createAnthropic({ apiKey: keys.anthropicApiKey }))
  if (keys.openaiApiKey) providers.set('openai', createOpenAI({ apiKey: keys.openaiApiKey }))

  const providerFor = (id: string): { provider: ProviderV4; modelId: string } => {
    const parsed = parseModelId(id)
    const provider = providers.get(parsed.provider)
    if (provider) return { provider, modelId: parsed.modelId }
    const known: readonly string[] = KNOWN_PROVIDERS
    throw new SupportModelConfigError(
      known.includes(parsed.provider)
        ? `Model provider "${parsed.provider}" is not configured: its API key is missing`
        : `Unknown model provider "${parsed.provider}"; supported: ${KNOWN_PROVIDERS.join(', ')}`,
    )
  }

  return {
    chatModel(id) {
      const { provider, modelId } = providerFor(id)
      return aiSdkChatModel(
        resolve(() => provider.languageModel(modelId), id),
        id,
      )
    },
    embedder(id) {
      const { provider, modelId } = providerFor(id)
      return aiSdkEmbedder(
        resolve(() => provider.embeddingModel(modelId), id),
        id,
      )
    },
  }
}

function resolve<T>(factory: () => T, id: string): T {
  try {
    return factory()
  } catch (error: unknown) {
    throw new SupportModelConfigError(`Model "${id}" is not available`, { cause: error })
  }
}

function toToolSet(specs: readonly ToolSpec[]): ToolSet {
  const tools: ToolSet = {}
  for (const spec of specs) {
    tools[spec.name] = tool({
      description: spec.description,
      inputSchema: jsonSchema(spec.inputSchema),
    })
  }
  return tools
}

function toAiMessage(message: ModelMessage): AiModelMessage {
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
