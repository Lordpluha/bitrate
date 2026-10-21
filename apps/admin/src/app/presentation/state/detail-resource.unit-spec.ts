import { ResourceNotFoundError } from '@domain/shared'
import { describe, expect, it } from 'vitest'
import { createDetailResource } from './detail-resource'

type Row = { id: string }

describe('createDetailResource', () => {
  it('starts loading with nothing to show', () => {
    const resource = createDetailResource<Row>({
      load: async () => ({ id: 'a' }),
      errorMessage: 'nope',
    })

    expect(resource.loading()).toBe(true)
    expect(resource.value()).toBeNull()
    expect(resource.notFound()).toBe(false)
    expect(resource.failure()).toBeNull()
  })

  it('holds the loaded record', async () => {
    const resource = createDetailResource<Row>({
      load: async () => ({ id: 'a' }),
      errorMessage: 'nope',
    })

    await resource.reload()

    expect(resource.value()).toEqual({ id: 'a' })
    expect(resource.loading()).toBe(false)
  })

  it('reports a missing record as not found, not as a failure', async () => {
    const resource = createDetailResource<Row>({
      load: () => Promise.reject(new ResourceNotFoundError()),
      errorMessage: 'Could not load this row.',
    })

    await resource.reload()

    expect(resource.notFound()).toBe(true)
    expect(resource.failure()).toBeNull()
  })

  it('reports any other failed read as a failure and keeps the last record on screen', async () => {
    let shouldFail = false
    const resource = createDetailResource<Row>({
      load: async () => {
        if (shouldFail) throw new Error('500')
        return { id: 'a' }
      },
      errorMessage: 'Could not load this row.',
    })
    await resource.reload()

    shouldFail = true
    await resource.reload()

    expect(resource.failure()).toBe('Could not load this row.')
    expect(resource.notFound()).toBe(false)
    expect(resource.value()).toEqual({ id: 'a' })
  })
})
