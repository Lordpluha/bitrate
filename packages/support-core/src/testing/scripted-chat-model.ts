import type { ChatModel, ChatStepEvent, ChatStepInput } from '../ports.js'

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
