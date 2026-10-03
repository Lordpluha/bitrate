import { describe, expect, it } from '@jest/globals'
import { checkMetricsAccess } from './metrics-token'

const TOKEN = 't'.repeat(32)

describe('checkMetricsAccess', () => {
  it('reports the endpoint as disabled when no token is configured', () => {
    expect(checkMetricsAccess(undefined, `Bearer ${TOKEN}`)).toBe('disabled')
  })

  it('grants access to the exact bearer token', () => {
    expect(checkMetricsAccess(TOKEN, `Bearer ${TOKEN}`)).toBe('granted')
  })

  it.each([
    ['a missing header', undefined],
    ['a non-bearer scheme', `Basic ${TOKEN}`],
    ['a wrong token', `Bearer ${'x'.repeat(32)}`],
    ['a token of another length', 'Bearer short'],
  ])('denies %s', (_label, header) => {
    expect(checkMetricsAccess(TOKEN, header)).toBe('denied')
  })
})
