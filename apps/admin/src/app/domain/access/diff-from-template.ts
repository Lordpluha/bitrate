import type { Permission } from './permission'

type DiffFromTemplateInput = {
  permissions: readonly Permission[]
  template: readonly Permission[]
}

/** What an operator's actual permissions add or drop relative to their role's current template. */
export type PermissionDiff = {
  /** In the template, not held. */
  missing: Permission[]
  /** Held, not in the template. */
  extra: Permission[]
}

/**
 * Compares as sets — order and duplicates in either list must not manufacture a difference.
 * The API had exactly that bug (permissions compared as ordered arrays) before it was fixed;
 * this stays a set comparison on purpose.
 */
export function diffFromTemplate({ permissions, template }: DiffFromTemplateInput): PermissionDiff {
  const held = new Set(permissions)
  const templated = new Set(template)

  return {
    missing: [...templated].filter((permission) => !held.has(permission)),
    extra: [...held].filter((permission) => !templated.has(permission)),
  }
}
