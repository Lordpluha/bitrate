import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it, jest } from '@jest/globals'
import { AdminAuthGuard, REQUIRED_ROLES } from '@modules/admin-auth'
import type { Type } from '@nestjs/common'
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants'
import { Reflector } from '@nestjs/core'
import type { StaffRole } from '@prisma/client'

/** `TrackUploadService` pulls in `music-metadata` via `track-media.ts`; that package
 * cannot be resolved under Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

type RouteHandler = (...args: never[]) => unknown

type Route = {
  id: string
  controller: Type
  handler: RouteHandler
}

/** Where the operator surface lives. Both trees, because `admin-auth` sits outside `admin/`. */
const OPERATOR_ROOTS = [join(__dirname), join(__dirname, '..', 'admin-auth')]

/**
 * The routes reachable without a staff session, named one by one.
 *
 * `login` has to be public — it is how a session starts. Everything else on the operator surface
 * is staff-only, so this list existing at all is the point: adding to it is a decision someone
 * makes on purpose, in a diff, rather than by forgetting a decorator.
 */
const PUBLIC_ROUTES = new Set(['AdminAuthController.login'])

/** Controller files under the operator trees, found on disk rather than through the module graph. */
function controllerFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => entry.name.endsWith('.controller.ts'))
    .map((entry) => join(entry.parentPath, entry.name))
}

/**
 * Discovery is filesystem-based on purpose. Importing `AdminModule` would pull the whole service
 * layer with it — including an ESM-only audio dependency the CJS unit runner cannot load — and
 * the point of this test is that it keeps working without anyone tending it.
 */
function loadControllers(): Type[] {
  return OPERATOR_ROOTS.flatMap(controllerFiles).flatMap((file) => {
    const relativePath = relative(__dirname, file).replace(/\.ts$/, '')
    const loaded: Record<string, unknown> = require(
      relativePath.startsWith('.') ? relativePath : `./${relativePath}`,
    )

    return Object.values(loaded).filter(
      (exported): exported is Type =>
        typeof exported === 'function' && exported.name.endsWith('Controller'),
    )
  })
}

/** Prototype members Nest has tagged with a route path. */
function routesOf(controller: Type): Route[] {
  const prototype = controller.prototype as Record<string, RouteHandler>

  return Object.getOwnPropertyNames(prototype)
    .filter((name) => name !== 'constructor')
    .filter((name) => Reflect.hasMetadata(PATH_METADATA, prototype[name] as object))
    .map((name) => ({
      id: `${controller.name}.${name}`,
      controller,
      handler: prototype[name] as RouteHandler,
    }))
}

/**
 * The guard is the whole access-control story for the operator surface, and a route that forgets
 * it fails open: it answers to anyone who finds the path, with no session. Nothing else catches
 * that — the controller compiles, lint passes, and the integration specs stub the guard with a
 * role check that lets a route carrying no role metadata straight through.
 */
describe('operator surface access control', () => {
  const reflector = new Reflector()
  const controllers = loadControllers()
  const guarded = controllers.filter((controller) => controller.name !== 'AdminAuthController')

  it('finds every operator controller on disk', () => {
    expect(controllers.map((controller) => controller.name).sort()).toEqual([
      'AdminArtistsController',
      'AdminAuditController',
      'AdminAuthController',
      'AdminModerationController',
      'AdminTracksController',
      'AdminUsersController',
    ])
  })

  it.each(controllers.flatMap(routesOf))('$id requires a staff session', (route) => {
    if (PUBLIC_ROUTES.has(route.id)) return

    const guards: unknown[] =
      Reflect.getMetadata(GUARDS_METADATA, route.handler) ??
      Reflect.getMetadata(GUARDS_METADATA, route.controller) ??
      []

    expect(guards).toContain(AdminAuthGuard)
    expect(
      reflector.getAllAndOverride<StaffRole[]>(REQUIRED_ROLES, [route.handler, route.controller]),
    ).toBeDefined()
  })

  /**
   * The class-level decorator is the floor, not decoration: it is what turns a forgotten
   * method-level decorator into a too-broad role rather than an open endpoint.
   */
  it.each(
    guarded.map((controller) => ({ name: controller.name, controller })),
  )('$name carries a class-level role floor', ({ controller }) => {
    expect(Reflect.getMetadata(REQUIRED_ROLES, controller)).toEqual(['ADMIN', 'MODERATOR'])
  })

  /** And the floor still has to be narrowable, or it would be the wrong mechanism. */
  it.each([
    { id: 'AdminUsersController.remove' },
    { id: 'AdminArtistsController.remove' },
    { id: 'AdminArtistsController.updateVerification' },
    { id: 'AdminTracksController.reprocess' },
  ])('$id narrows the floor to ADMIN alone', ({ id }) => {
    const route = controllers.flatMap(routesOf).find((candidate) => candidate.id === id)
    expect(route).toBeDefined()

    const found = route as Route
    expect(
      reflector.getAllAndOverride<StaffRole[]>(REQUIRED_ROLES, [found.handler, found.controller]),
    ).toEqual(['ADMIN'])
  })
})
