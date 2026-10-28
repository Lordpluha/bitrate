import { describe, expect, it } from 'vitest'
import { currentStage, stageProgress } from './stages'

describe('release stages', () => {
  it.each([
    ['DRAFT', 'draft'],
    ['SUBMITTED', 'review'],
    ['REJECTED', 'review'],
    ['READY', 'launch'],
    ['PUBLISHING', 'launch'],
    ['PUBLISH_FAILED', 'launch'],
    ['RELEASED', 'launch'],
  ] as const)('opens a %s release on its %s stage', (status, stage) => {
    expect(currentStage(status)).toBe(stage)
  })

  it('marks only the draft as in progress before submission', () => {
    expect(stageProgress('DRAFT')).toEqual({
      draft: 'current',
      review: 'upcoming',
      deliver: 'upcoming',
      launch: 'upcoming',
    })
  })

  it('keeps review in progress while Bitrate asks for changes', () => {
    expect(stageProgress('REJECTED')).toMatchObject({
      draft: 'complete',
      review: 'current',
      deliver: 'upcoming',
    })
  })

  it('opens publishing on Launch and keeps delivery optional once approved', () => {
    expect(stageProgress('READY')).toEqual({
      draft: 'complete',
      review: 'complete',
      deliver: 'optional',
      launch: 'current',
    })
  })

  it('completes every stage before launch once released', () => {
    expect(stageProgress('RELEASED')).toEqual({
      draft: 'complete',
      review: 'complete',
      deliver: 'complete',
      launch: 'current',
    })
  })
})
