import type { LanguageModelV4StreamPart } from '@ai-sdk/provider'
import { convertArrayToReadableStream, MockLanguageModelV4 } from 'ai/test'
import { describe, expect, it } from 'vitest'
import type { ChatStepEvent, ChatStepInput } from '../ports.js'
import { SUPPORT_TOOLS } from '../prompts/support-tools.js'
import { aiSdkChatModel } from './ai-sdk-chat-model.js'
import { SupportModelError } from './support-model-error.js'

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

const toolCall = (toolName: string, input: unknown): LanguageModelV4StreamPart => ({
  type: 'tool-call',
  toolCallId: 'c2',
  toolName,
  input: JSON.stringify(input),
})

describe('aiSdkChatModel', () => {
  it('streams text and tool calls of one step, with usage', async () => {
    const model = mockModel([
      { type: 'stream-start', warnings: [] },
      { type: 'text-start', id: 't1' },
      { type: 'text-delta', id: 't1', delta: 'Let me ' },
      { type: 'text-delta', id: 't1', delta: 'check.' },
      { type: 'text-end', id: 't1' },
      toolCall('handoff_to_operator', { reason: 'needs a person' }),
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
      toolCall('search_knowledge', { query: 'delete account' }),
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
