import { describe, expect, it } from '@jest/globals'
import type { DynamicModule, ForwardReference, Provider, Type } from '@nestjs/common'
import { MODULE_METADATA, PATH_METADATA } from '@nestjs/common/constants'
import { AdminAppModule } from './admin-app.module'
import { AppController } from './app.controller'
import { AppModule } from './app.module'

/** Metadata key `@Processor` writes; `@nestjs/bullmq` does not export the constant. */
const PROCESSOR_METADATA = 'bullmq:processor_metadata'

type ModuleImport = Type | DynamicModule | ForwardReference

/** What a root module registers once Nest resolves every import, read without instantiating it. */
type Registered = { controllers: Set<Type>; providerClasses: Set<Type> }

function moduleList(value: unknown): ModuleImport[] {
  return Array.isArray(value) ? (value as ModuleImport[]) : []
}

function providerClass(provider: Provider): Type | undefined {
  if (typeof provider === 'function') return provider
  return 'useClass' in provider ? provider.useClass : undefined
}

/** Walks the import graph the way Nest's scanner does: classes, dynamic modules, forward refs. */
function registeredBy(root: Type): Registered {
  const registered: Registered = { controllers: new Set(), providerClasses: new Set() }
  const seen = new Set<unknown>()

  const visit = (entry: ModuleImport) => {
    const resolved = 'forwardRef' in entry ? entry.forwardRef() : entry
    if (seen.has(resolved)) return
    seen.add(resolved)

    const moduleClass: Type = 'module' in resolved ? resolved.module : resolved
    const dynamic: Partial<DynamicModule> = 'module' in resolved ? resolved : {}
    const read = (key: string, extra: unknown[] | undefined) => [
      ...moduleList(Reflect.getMetadata(key, moduleClass)),
      ...(extra ?? []),
    ]

    for (const controller of read(MODULE_METADATA.CONTROLLERS, dynamic.controllers)) {
      registered.controllers.add(controller as Type)
    }
    for (const provider of read(MODULE_METADATA.PROVIDERS, dynamic.providers)) {
      const cls = providerClass(provider as Provider)
      if (cls) registered.providerClasses.add(cls)
    }
    for (const child of read(MODULE_METADATA.IMPORTS, dynamic.imports)) visit(child as ModuleImport)
  }

  visit(root)
  return registered
}

function controllerPaths(controllers: Iterable<Type>): string[] {
  return [...controllers].flatMap((controller) => {
    const path: unknown = Reflect.getMetadata(PATH_METADATA, controller)
    return Array.isArray(path) ? path.map(String) : [String(path)]
  })
}

const isOperatorPath = (path: string) => /^\/?admin(\/|$)/.test(path)

describe('API surfaces (#458)', () => {
  it('the public process registers no operator route', () => {
    const paths = controllerPaths(registeredBy(AppModule).controllers)

    expect(paths.filter(isOperatorPath)).toEqual([])
    expect(paths).toEqual(expect.arrayContaining(['tracks']))
  })

  it('the operator process registers only operator routes and the shared health controller', () => {
    const { controllers } = registeredBy(AdminAppModule)
    const foreign = [...controllers].filter(
      (controller) =>
        controller !== AppController && !controllerPaths([controller]).every(isOperatorPath),
    )

    expect(foreign.map((controller) => controller.name)).toEqual([])
    expect(controllers).toContain(AppController)
    expect(controllerPaths(controllers)).toEqual(
      expect.arrayContaining(['admin/auth', 'admin/tracks']),
    )
  })

  it('the operator process consumes no queue', () => {
    const consumers = [...registeredBy(AdminAppModule).providerClasses].filter((cls) =>
      Reflect.hasMetadata(PROCESSOR_METADATA, cls),
    )

    expect(consumers.map((cls) => cls.name)).toEqual([])
  })
})
