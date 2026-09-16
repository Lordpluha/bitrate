import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it, jest } from '@jest/globals'
import {
  AdminAuthGuard,
  PERMISSIONS,
  type Permission,
  REQUIRED_PERMISSION,
} from '@modules/admin-auth'
import type { Type } from '@nestjs/common'
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants'
import { Reflector } from '@nestjs/core'

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

/**
 * Routes that require only a staff session — no permission. `me`/`logout`/`refresh` act on the
 * caller's own account and never gate on what it may do to anyone else's.
 */
const SESSION_ONLY_ROUTES = new Set([
  'AdminAuthController.getMe',
  'AdminAuthController.logout',
  'AdminAuthController.refresh',
])

/**
 * The permission every other route requires. Adding, removing, or renarrowing a route is a line
 * in this table — a route missing from it, or a route whose decorator disagrees with it, fails
 * the spec below.
 */
const ROUTE_PERMISSIONS: Record<string, Permission> = {
  'AdminArtistsController.list': 'artists:read',
  'AdminArtistsController.getById': 'artists:read',
  'AdminArtistsController.updateVerification': 'artists:verify',
  'AdminArtistsController.remove': 'artists:delete',
  'AdminAuditController.list': 'audit:read',
  'AdminModerationController.list': 'reports:read',
  'AdminModerationController.getById': 'reports:read',
  'AdminModerationController.update': 'reports:advance',
  'AdminRolesController.list': 'roles:read',
  'AdminRolesController.permissions': 'roles:read',
  'AdminRolesController.getById': 'roles:read',
  'AdminRolesController.create': 'roles:write',
  'AdminRolesController.update': 'roles:write',
  'AdminRolesController.remove': 'roles:write',
  'AdminStaffController.list': 'staff:read',
  'AdminStaffController.getById': 'staff:read',
  'AdminStaffController.create': 'staff:write',
  'AdminStaffController.assignRole': 'staff:write',
  'AdminStaffController.updatePermissions': 'staff:write',
  'AdminStaffController.remove': 'staff:write',
  'AdminTracksController.list': 'tracks:read',
  'AdminTracksController.getById': 'tracks:read',
  'AdminTracksController.reprocess': 'tracks:reprocess',
  'AdminUsersController.list': 'users:read',
  'AdminUsersController.getById': 'users:read',
  'AdminUsersController.remove': 'users:delete',
}

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
 * permission check that lets a route carrying no permission metadata straight through.
 */
describe('operator surface access control', () => {
  const reflector = new Reflector()
  const controllers = loadControllers()
  const allRoutes = controllers.flatMap(routesOf)
  const guardedRoutes = allRoutes.filter((route) => !PUBLIC_ROUTES.has(route.id))
  const permissionRoutes = guardedRoutes.filter((route) => !SESSION_ONLY_ROUTES.has(route.id))

  it('finds every operator controller on disk', () => {
    expect(controllers.map((controller) => controller.name).sort()).toEqual([
      'AdminArtistsController',
      'AdminAuditController',
      'AdminAuthController',
      'AdminModerationController',
      'AdminRolesController',
      'AdminStaffController',
      'AdminTracksController',
      'AdminUsersController',
    ])
  })

  it.each(guardedRoutes)('$id requires a staff session', (route) => {
    const guards: unknown[] =
      Reflect.getMetadata(GUARDS_METADATA, route.handler) ??
      Reflect.getMetadata(GUARDS_METADATA, route.controller) ??
      []

    expect(guards).toContain(AdminAuthGuard)
  })

  it.each(
    Array.from(SESSION_ONLY_ROUTES, (id) => ({ id })),
  )('$id carries no permission requirement', ({ id }) => {
    const route = guardedRoutes.find((candidate) => candidate.id === id)
    expect(route).toBeDefined()

    const found = route as Route
    expect(
      reflector.getAllAndOverride<Permission | undefined>(REQUIRED_PERMISSION, [
        found.handler,
        found.controller,
      ]),
    ).toBeUndefined()
  })

  /**
   * Every route that isn't public or session-only carries a permission from the catalogue,
   * matching this file's table exactly — a route added to a controller without a matching table
   * entry, or a decorator disagreeing with the table, fails here.
   */
  it('every permission-gated route matches the route → permission table exactly', () => {
    expect(permissionRoutes.map((route) => route.id).sort()).toEqual(
      Object.keys(ROUTE_PERMISSIONS).sort(),
    )
  })

  it.each(permissionRoutes)('$id requires its cataloged permission', (route) => {
    const required = reflector.getAllAndOverride<Permission | undefined>(REQUIRED_PERMISSION, [
      route.handler,
      route.controller,
    ])

    expect(required).toBeDefined()
    expect(PERMISSIONS).toContain(required)
    expect(required).toBe(ROUTE_PERMISSIONS[route.id])
  })
})
