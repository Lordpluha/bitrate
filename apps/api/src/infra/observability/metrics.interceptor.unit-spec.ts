import { describe, expect, it } from '@jest/globals'
import type { ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { resolveMetricRoute } from './metrics.interceptor'

class CatalogController {
  getItem() {
    return undefined
  }
}

const context = {
  getClass: () => CatalogController,
  getHandler: () => CatalogController.prototype.getItem,
} as unknown as ExecutionContext

describe('resolveMetricRoute', () => {
  it('uses the registered route template instead of a concrete request path', () => {
    const request = {
      path: '/api/v1/catalog/user-controlled-id',
      route: { path: '/api/v1/catalog/:id' },
    } as Request

    expect(resolveMetricRoute(context, request)).toBe('/api/v1/catalog/:id')
  })

  it('uses bounded controller metadata when no route template exists', () => {
    const request = { path: `/missing/${'x'.repeat(1_000)}` } as Request

    expect(resolveMetricRoute(context, request)).toBe('CatalogController.getItem')
  })
})
