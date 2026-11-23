import type { LanguageModelV4StreamPart } from '@ai-sdk/provider'
import { convertArrayToReadableStream, MockEmbeddingModelV4, MockLanguageModelV4 } from 'ai/test'
import { describe, expect, it } from 'vitest'
import type { ChatStepEvent, ChatStepInput } from '../ports.js'
import { SUPPORT_TOOLS } from '../prompts.js'
import {
  aiSdkChatModel,
  aiSdkEmbedder,
  createSupportModels,
  SupportModelConfigError,
  SupportModelError,
} from './index.js'

const usage = {
  inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 7, text: 7, reasoning: 0 },
}

function mockModel(parts: LanguageModelV4StreamPart[]) {
  return new MockLanguageModelV4({
    provider: 'mock',
    modelId: 'mock-model',
    doStream: async () => ({ stream: convertArrayToReadableStream(parts) }),
  })
}

const input: ChatStepInput = {
  system: 'You are support.',
  messages: [
    { role: 'user', content: 'How do I delete my account?' },
    {
      role: 'assistant',
      content: '',
      toolCalls: [{ id: 'c1', name: 'search_knowledge', input: { query: 'delete account' } }],
    },
    {
      role: 'tool',
      toolCallId: 'c1',
      toolName: 'search_knowledge',
      content: '<article>…</article>',
    },
  ],
  tools: SUPPORT_TOOLS,
  toolChoice: 'required',
}

async function collect(events: AsyncIterable<ChatStepEvent>) {
  const out: ChatStepEvent[] = []
  for await (const event of events) out.push(event)
  return out
}

describe('aiSdkChatModel', () => {
  it('streams text and tool calls of one step, with usage', async () => {
    const model = mockModel([
      { type: 'stream-start', warnings: [] },
      { type: 'text-start', id: 't1' },
      { type: 'text-delta', id: 't1', delta: 'Let me ' },
      { type: 'text-delta', id: 't1', delta: 'check.' },
      { type: 'text-end', id: 't1' },
      {
        type: 'tool-call',
        toolCallId: 'c2',
        toolName: 'handoff_to_operator',
        input: JSON.stringify({ reason: 'needs a person' }),
      },
      { type: 'finish', usage, finishReason: { unified: 'tool-calls', raw: undefined } },
    ])

    const events = await collect(aiSdkChatModel(model, 'mock:mock-model').step(input))

    expect(events).toEqual([
      { type: 'text-delta', text: 'Let me ' },
      { type: 'text-delta', text: 'check.' },
      {
        type: 'tool-call',
        call: { id: 'c2', name: 'handoff_to_operator', input: { reason: 'needs a person' } },
      },
      { type: 'finish', usage: { inputTokens: 12, outputTokens: 7 } },
    ])
    expect(model.doStreamCalls).toHaveLength(1)
  })

  it('sends the system prompt, history with tool results, tools and tool choice', async () => {
    const model = mockModel([
      {
        type: 'tool-call',
        toolCallId: 'c2',
        toolName: 'search_knowledge',
        input: JSON.stringify({ query: 'delete account' }),
      },
      { type: 'finish', usage, finishReason: { unified: 'tool-calls', raw: undefined } },
    ])

    await collect(aiSdkChatModel(model, 'mock:mock-model').step(input))

    const call = model.doStreamCalls[0]
    expect(call?.toolChoice).toEqual({ type: 'required' })
    expect(call?.tools?.map((tool) => tool.name)).toEqual([
      'search_knowledge',
      'handoff_to_operator',
    ])
    expect(call?.prompt.map((message) => message.role)).toEqual([
      'system',
      'user',
      'assistant',
      'tool',
    ])
  })

  it('throws a SupportModelError when the provider stream fails', async () => {
    const model = mockModel([
      { type: 'error', error: new Error('overloaded') },
      { type: 'finish', usage, finishReason: { unified: 'error', raw: undefined } },
    ])

    await expect(collect(aiSdkChatModel(model, 'mock:mock-model').step(input))).rejects.toThrow(
      SupportModelError,
    )
  })
})

describe('aiSdkEmbedder', () => {
  it('returns one vector per text, in order', async () => {
    const model = new MockEmbeddingModelV4({
      doEmbed: async ({ values }) => ({
        embeddings: values.map((value) => [value.length, 0.5]),
        warnings: [],
      }),
    })

    const vectors = await aiSdkEmbedder(model, 'mock:embed').embed(['a', 'abc'])

    expect(vectors).toEqual([
      [1, 0.5],
      [3, 0.5],
    ])
  })
})

describe('createSupportModels (AC-6)', () => {
  const models = createSupportModels({ anthropicApiKey: 'test', openaiApiKey: 'test' })

  it('resolves models of different providers from provider:model ids', () => {
    expect(models.chatModel('anthropic:claude-haiku-5-5')).toMatchObject({
      provider: 'anthropic',
      modelId: 'claude-haiku-5-5',
    })
    expect(models.chatModel('openai:gpt-5.5-mini')).toMatchObject({
      provider: 'openai',
      modelId: 'gpt-5.5-mini',
    })
    expect(models.embedder('openai:text-embedding-3-small')).toMatchObject({
      provider: 'openai',
      modelId: 'text-embedding-3-small',
    })
  })

  it('rejects malformed ids and unconfigured providers with a clear error', () => {
    expect(() => models.chatModel('claude-haiku-5-5')).toThrow(SupportModelConfigError)
    expect(() => models.chatModel('mistral:large')).toThrow(/anthropic, openai/)
    expect(() => models.embedder('anthropic:')).toThrow(SupportModelConfigError)
  })

  it('only offers providers that have an API key', () => {
    const anthropicOnly = createSupportModels({ anthropicApiKey: 'test' })

    expect(() => anthropicOnly.embedder('openai:text-embedding-3-small')).toThrow(/not configured/)
  })
})
