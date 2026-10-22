import { signal } from '@angular/core'
import { describe, expect, it, vi } from 'vitest'
import { type ConfirmedWrite, createConfirmAction } from './confirm-action'

type Row = { title: string }
type Pending = 'take-down' | 'restore'

class StaleError extends Error {}

function setup({
  perform = async () => 'Done.',
  record = { title: 'Night Drive' },
}: {
  perform?: (write: ConfirmedWrite<Pending, Row>) => Promise<string>
  record?: Row | null
} = {}) {
  const failure = signal<string | null>(null)
  const reload = vi.fn(async () => undefined)
  const performSpy = vi.fn(perform)
  const action = createConfirmAction<Pending, Row>({
    record: signal(record),
    failure,
    perform: performSpy,
    describe: (error, write) =>
      `Could not ${write.pending}: ${error instanceof Error ? error.message : 'unknown'}`,
    isStale: (error) => error instanceof StaleError,
    reload,
  })
  return { action, failure, reload, perform: performSpy }
}

describe('createConfirmAction', () => {
  it('arms with a blank reason and clears leftover messages', () => {
    const { action, failure } = setup()
    action.reason.set('old')
    failure.set('old failure')

    action.arm('take-down')

    expect(action.pending()).toBe('take-down')
    expect(action.reason()).toBe('')
    expect(failure()).toBeNull()
  })

  it('performs with the trimmed reason, shows the status, reloads and closes', async () => {
    const { action, reload, perform } = setup()
    action.arm('take-down')
    action.reason.set('  spam  ')

    await action.confirm()

    expect(perform).toHaveBeenCalledWith({
      pending: 'take-down',
      record: { title: 'Night Drive' },
      reason: 'spam',
    })
    expect(action.status()).toBe('Done.')
    expect(reload).toHaveBeenCalledTimes(1)
    expect(action.pending()).toBeNull()
    expect(action.working()).toBe(false)
  })

  it('sends no reason when it is blank', async () => {
    const { action, perform } = setup()
    action.arm('restore')
    action.reason.set('   ')

    await action.confirm()

    expect(perform).toHaveBeenCalledWith(expect.objectContaining({ reason: undefined }))
  })

  it('reports a failed write and reloads only when the record changed elsewhere', async () => {
    const plain = setup({ perform: () => Promise.reject(new Error('boom')) })
    plain.action.arm('take-down')
    await plain.action.confirm()
    expect(plain.failure()).toBe('Could not take-down: boom')
    expect(plain.reload).not.toHaveBeenCalled()
    expect(plain.action.pending()).toBeNull()

    const stale = setup({ perform: () => Promise.reject(new StaleError('gone')) })
    stale.action.arm('restore')
    await stale.action.confirm()
    expect(stale.failure()).toBe('Could not restore: gone')
    expect(stale.reload).toHaveBeenCalledTimes(1)
  })

  it('does nothing until armed or while the record is not loaded', async () => {
    const idle = setup()
    await idle.action.confirm()
    expect(idle.perform).not.toHaveBeenCalled()

    const empty = setup({ record: null })
    empty.action.arm('take-down')
    await empty.action.confirm()
    expect(empty.perform).not.toHaveBeenCalled()
  })

  it('ignores cancel while a write is in flight', async () => {
    let finish: (status: string) => void = () => undefined
    const { action } = setup({
      perform: () =>
        new Promise<string>((resolve) => {
          finish = resolve
        }),
    })
    action.arm('take-down')
    const done = action.confirm()

    action.cancel()
    expect(action.pending()).toBe('take-down')

    finish('Done.')
    await done
    action.arm('restore')
    action.cancel()
    expect(action.pending()).toBeNull()
  })
})
