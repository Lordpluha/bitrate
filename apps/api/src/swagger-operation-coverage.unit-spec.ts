import path from 'node:path'
import { findControllerFiles, findRoutes } from '@common/swagger/controller-routes'
import { createRouteDocumentedChecker } from '@common/swagger/isRouteDocumented'
import { describe, expect, it } from '@jest/globals'
import { All, Delete, Get, Head, Options, Patch, Post, Put } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger'

/** Root of the API's own source tree — this spec's own directory. */
const SRC_DIR = __dirname

/** NestJS route-method decorators — a method carrying one of these is an HTTP route. */
const HTTP_METHOD_DECORATORS = { Get, Post, Put, Patch, Delete, Head, Options, All }

/** A route has exactly one HTTP verb and exactly one Swagger operation (direct or via a factory). */
const isDocumented = createRouteDocumentedChecker([
  { mode: 'one', decorators: HTTP_METHOD_DECORATORS },
  { mode: 'one', decorators: { ApiOperation, ApiExcludeEndpoint } },
])

describe('Swagger operation coverage', () => {
  const controllerFiles = findControllerFiles()
  const routes = controllerFiles.flatMap((file) => findRoutes(file, HTTP_METHOD_DECORATORS))

  it('discovers at least one controller and one route', () => {
    expect(controllerFiles.length).toBeGreaterThan(0)
    expect(routes.length).toBeGreaterThan(0)
  })

  it('documents every route with @ApiOperation or @ApiExcludeEndpoint', () => {
    const undocumented = routes
      .filter((route) => !isDocumented(route))
      .map((route) => `${path.relative(SRC_DIR, route.file)}::${route.method}`)

    expect(undocumented).toEqual([])
  })
})
