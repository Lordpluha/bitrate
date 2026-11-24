import { SupportAgent } from '../agent/support-agent.js'
import type { ConversationSnapshot, SupportEvent } from '../domain.js'
import { FakeEmbedder } from './fake-embedder.js'
import { InMemoryKnowledgeIndex, type StoredHit } from './in-memory-knowledge-index.js'
import { type ScriptedStep, ScriptedChatModel } from './scripted-chat-model.js'

export const deleteAccountHit: StoredHit = {
  chunkId: 'listener/en/delete-account#0',
  title: 'Delete your listener account',
  url: 'https://bitrate.me/legal/privacy',
  text: 'Email tesluakevlad@gmail.com with the subject "Delete my account".',
  score: 0.82,
  audience: 'listener',
  locale: 'en',
}

export const artistHit: StoredHit = {
  chunkId: 'artist/en/delete-account#0',
  title: 'Delete your artist account',
  text: 'Artists delete their account under Settings.',
  score: 0.9,
  audience: 'artist',
  locale: 'en',
}

export const searchStep = (query: string): ScriptedStep => ({
  toolCalls: [{ name: 'search_knowledge', input: { query } }],
})

export function conversation(overrides: Partial<ConversationSnapshot> = {}): ConversationSnapshot {
  return {
    audience: 'listener',
    locale: 'en',
    channel: 'web',
    state: 'bot',
    history: [],
    ...overrides,
  }
}

export async function collect(events: AsyncIterable<SupportEvent>): Promise<SupportEvent[]> {
  const out: SupportEvent[] = []
  for await (const event of events) out.push(event)
  return out
}

export function textOf(events: readonly SupportEvent[]): string {
  return events.flatMap((event) => (event.type === 'text-delta' ? [event.text] : [])).join('')
}

/** An agent over scripted fakes, with the fakes exposed for assertions. */
export function setupAgent(
  script: ScriptedStep[],
  hits: StoredHit[] = [deleteAccountHit, artistHit],
) {
  const model = new ScriptedChatModel(script)
  const index = new InMemoryKnowledgeIndex(hits)
  const agent = new SupportAgent({ chatModel: model, embedder: new FakeEmbedder(), index })
  return { agent, model, index }
}
