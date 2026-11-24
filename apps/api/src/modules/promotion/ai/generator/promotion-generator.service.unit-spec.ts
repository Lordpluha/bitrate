import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { MockLanguageModelV4 } from 'ai/test'
import { z } from 'zod'
import type { AiCallRecord, AiUsageService } from '../../usage/ai-usage.service'
import { type ModelRef, parseModelRef, type TaskRoute } from '../routing'
import { PromotionModelUnavailableError, PromotionOutputRejectedError } from './generation-errors'
import { PromotionGenerator } from './promotion-generator.service'
import type { PromotionModels } from './promotion-models'

const usage = {
  inputTokens: { total: 100, noCache: 100, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 20, text: 20, reasoning: undefined },
}
/** A model that answers each call with the next text in `texts`, or throws for an Error. */
const scripted = (...answers: Array<string | Error>) => {
  let call = 0
  return new MockLanguageModelV4({
    doGenerate: () => {
      const answer = answers[Math.min(call++, answers.length - 1)]
      if (answer instanceof Error) return Promise.reject(answer)
      return Promise.resolve({
        content: [{ type: 'text' as const, text: answer ?? '' }],
        finishReason: { unified: 'stop' as const, raw: undefined },
        usage,
        warnings: [],
      })
    },
  })
}

const PRIMARY = parseModelRef('anthropic:claude-sonnet-5-5')
const FALLBACK = parseModelRef('mistral:mistral-large-4')
const schema = z.object({ caption: z.string() })
const request = {
  artistId: 'artist-1',
  task: 'copy' as const,
  schema,
  system: 'Write one caption.',
  prompt: 'Release: Afterglow, Sep 26.',
  facts: ['Release: Afterglow, Sep 26'],
  textOf: (output: z.infer<typeof schema>) => output.caption,
}
const caption = (text: string) => JSON.stringify({ caption: text })

describe('PromotionGenerator', () => {
  let records: AiCallRecord[]
  let usageService: AiUsageService

  beforeEach(() => {
    records = []
    usageService = {
      record: jest.fn((record: AiCallRecord) => {
        records.push(record)
        return Promise.resolve(1)
      }),
    } as unknown as AiUsageService
  })

  const generator = (models: Map<string, MockLanguageModelV4>, route: TaskRoute) => {
    const routes = { plan: route, copy: route, translate: route, check: route }
    const resolved: PromotionModels = {
      routes,
      languageModel: (ref: ModelRef) => {
        const model = models.get(ref.id)
        if (!model) throw new Error(`no mock for ${ref.id}`)
        return model
      },
    }
    return new PromotionGenerator(resolved, usageService)
  }
  const outcomes = () => records.map((r) => `${r.model.id}:${r.outcome}`)

  it('returns a grounded output and records the call', async () => {
    const primary = scripted(caption('Afterglow arrives Sep 26.'))
    const result = await generator(new Map([[PRIMARY.id, primary]]), {
      primary: PRIMARY,
      fallback: null,
    }).generate(request)
    expect(result).toEqual({ output: { caption: 'Afterglow arrives Sep 26.' }, model: PRIMARY.id })
    expect(outcomes()).toEqual([`${PRIMARY.id}:SUCCEEDED`])
    expect(records[0]?.usage).toEqual({ inputTokens: 100, cachedInputTokens: 0, outputTokens: 20 })
  })

  it('regenerates once, naming the ungrounded claims, and keeps the second output', async () => {
    const primary = scripted(
      caption('Afterglow, already 50,000 streams.'),
      caption('Afterglow arrives.'),
    )
    const result = await generator(new Map([[PRIMARY.id, primary]]), {
      primary: PRIMARY,
      fallback: null,
    }).generate(request)
    expect(result.output.caption).toBe('Afterglow arrives.')
    expect(outcomes()).toEqual([`${PRIMARY.id}:REJECTED_UNGROUNDED`, `${PRIMARY.id}:SUCCEEDED`])
    expect(JSON.stringify(primary.doGenerateCalls[1]?.prompt)).toContain('50,000')
  })

  it('gives up after two rejected outputs', async () => {
    const primary = scripted(caption('Our award-winning single.'))
    const error = await generator(new Map([[PRIMARY.id, primary]]), {
      primary: PRIMARY,
      fallback: FALLBACK,
    })
      .generate(request)
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(PromotionOutputRejectedError)
    expect((error as PromotionOutputRejectedError).claims).toEqual([
      { kind: 'achievement', value: 'award-winning' },
    ])
    expect(outcomes()).toEqual([
      `${PRIMARY.id}:REJECTED_UNGROUNDED`,
      `${PRIMARY.id}:REJECTED_UNGROUNDED`,
    ])
  })

  it('treats output that does not match the schema as a rejected attempt', async () => {
    const primary = scripted('not json at all', caption('Afterglow arrives.'))
    const result = await generator(new Map([[PRIMARY.id, primary]]), {
      primary: PRIMARY,
      fallback: null,
    }).generate(request)
    expect(result.output.caption).toBe('Afterglow arrives.')
    expect(outcomes()).toEqual([`${PRIMARY.id}:REJECTED_SCHEMA`, `${PRIMARY.id}:SUCCEEDED`])
  })

  it('falls back to the second model when the provider fails', async () => {
    const primary = scripted(new Error('overloaded'))
    const fallback = scripted(caption('Afterglow arrives.'))
    const result = await generator(
      new Map([
        [PRIMARY.id, primary],
        [FALLBACK.id, fallback],
      ]),
      { primary: PRIMARY, fallback: FALLBACK },
    ).generate(request)
    expect(result.model).toBe(FALLBACK.id)
    expect(outcomes()).toEqual([`${PRIMARY.id}:FAILED`, `${FALLBACK.id}:SUCCEEDED`])
  })

  it('reports the task unavailable when no model can serve it', async () => {
    const primary = scripted(new Error('overloaded'))
    await expect(
      generator(new Map([[PRIMARY.id, primary]]), { primary: PRIMARY, fallback: null }).generate(
        request,
      ),
    ).rejects.toBeInstanceOf(PromotionModelUnavailableError)
    expect(outcomes()).toEqual([`${PRIMARY.id}:FAILED`])
  })
})
