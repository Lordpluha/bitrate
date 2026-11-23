import type {
  ChatModel,
  ChatStepEvent,
  ChatStepInput,
  Embedder,
  KnowledgeHit,
  KnowledgeIndex,
  KnowledgeQuery,
} from '../ports.js'

/** What the fake model does on one step. */
export interface ScriptedStep {
  text?: string
  toolCalls?: { name: string; input: unknown }[]
  usage?: { inputTokens: number; outputTokens: number }
}

/** A chat model that plays back a fixed script, one entry per step, and records inputs. */
export class ScriptedChatModel implements ChatModel {
  readonly provider = 'fake'
  readonly modelId = 'scripted'
  readonly calls: ChatStepInput[] = []
  private readonly script: ScriptedStep[]

  constructor(script: ScriptedStep[]) {
    this.script = [...script]
  }

  async *step(input: ChatStepInput): AsyncIterable<ChatStepEvent> {
    this.calls.push(structuredClone(input))
    const step = this.script.shift()
    if (!step) throw new Error('ScriptedChatModel: no step left in the script')
    if (step.text) {
      for (const word of step.text.split(/(?<= )/)) yield { type: 'text-delta', text: word }
    }
    let index = 0
    for (const call of step.toolCalls ?? []) {
      index += 1
      yield {
        type: 'tool-call',
        call: { id: `call-${this.calls.length}-${index}`, name: call.name, input: call.input },
      }
    }
    yield { type: 'finish', usage: step.usage ?? { inputTokens: 10, outputTokens: 5 } }
  }
}

export class FakeEmbedder implements Embedder {
  readonly provider = 'fake'
  readonly modelId = 'fake-embedding'
  readonly inputs: string[] = []

  async embed(texts: readonly string[]): Promise<number[][]> {
    this.inputs.push(...texts)
    return texts.map((text) => [text.length, 1])
  }
}

/** A knowledge hit stored with the filters the index applies. */
export interface StoredHit extends KnowledgeHit {
  audience: KnowledgeQuery['audiences'][number]
  locale: NonNullable<KnowledgeQuery['locale']>
}

/** Returns stored hits that pass the audience and locale filters, best first. */
export class InMemoryKnowledgeIndex implements KnowledgeIndex {
  readonly queries: KnowledgeQuery[] = []
  private readonly hits: StoredHit[]

  constructor(hits: StoredHit[]) {
    this.hits = hits
  }

  async search(query: KnowledgeQuery): Promise<KnowledgeHit[]> {
    this.queries.push(query)
    return this.hits
      .filter((hit) => query.audiences.includes(hit.audience))
      .filter((hit) => query.locale === undefined || hit.locale === query.locale)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit)
      .map(({ audience: _audience, locale: _locale, ...hit }) => hit)
  }
}
