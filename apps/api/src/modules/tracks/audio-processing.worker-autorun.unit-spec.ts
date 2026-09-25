import { describe, expect, it } from '@jest/globals'
import { isAudioProcessingWorkerAutorunEnabled } from './audio-processing.worker-autorun'

describe('isAudioProcessingWorkerAutorunEnabled', () => {
  it('defaults to enabled when the variable is unset', () => {
    expect(isAudioProcessingWorkerAutorunEnabled({})).toBe(true)
  })

  it('stays enabled for any value other than the literal string "false"', () => {
    expect(isAudioProcessingWorkerAutorunEnabled({ AUDIO_PROCESSING_WORKER_ENABLED: 'true' })).toBe(
      true,
    )
  })

  it('disables the worker only for the literal string "false"', () => {
    expect(
      isAudioProcessingWorkerAutorunEnabled({ AUDIO_PROCESSING_WORKER_ENABLED: 'false' }),
    ).toBe(false)
  })
})
