import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DATA_OWNERS } from './data-ownership.mjs'

const apiRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Prisma delegate methods that change rows. Reads (`find*`, `count`, `aggregate`) are open. */
export const WRITE_METHODS = new Set([
  'create',
  'createMany',
  'createManyAndReturn',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
  'delete',
  'deleteMany',
])

/**
 * Reads the delegate names (`model Track` -> `track`) declared in a Prisma schema — one
 * `schema.prisma` file or a multi-file schema folder of `*.prisma` files.
 */
export function readSchemaModels(schemaPath) {
  const files = statSync(schemaPath).isDirectory()
    ? readdirSync(schemaPath, { recursive: true })
        .filter((name) => name.endsWith('.prisma'))
        .map((name) => join(schemaPath, name))
    : [schemaPath]
  const schema = files.map((file) => readFileSync(file, 'utf8')).join('\n')
  return new Set(
    [...schema.matchAll(/^model (\w+)/gm)].map(([, name]) => name[0].toLowerCase() + name.slice(1)),
  )
}

/**
 * The ownership scope of a file: `src/modules/<module>`, `src/modules/admin/<area>` or
 * `src/infra/<folder>`. Files directly in `src/modules/admin/` belong to `admin` itself.
 */
export function scopeOf(srcRoot, filename) {
  const path = relative(srcRoot, filename)
  if (path.startsWith('..')) return undefined
  const [area, first, second, third] = path.split(sep)
  if (area === 'modules' && first === 'admin' && third !== undefined) return `admin/${second}`
  if (area === 'modules') return first
  if (area === 'infra' && second !== undefined) return `infra/${first}`
  return area
}

/** The non-computed property name of a member expression, if it has one. */
function propertyName(node) {
  if (node?.type !== 'MemberExpression' || node.computed) return undefined
  return node.property.type === 'Identifier' ? node.property.name : undefined
}

/**
 * Builds the rule that reports a Prisma write (`<client>.<model>.<create|update|delete…>(…)`)
 * from a scope that does not own the model. Matching is syntactic: the client can be
 * `this.prisma`, a transaction `tx` or any alias. Nested relation writes inside `data` and raw
 * SQL are not seen; ADR-0060 records that limit.
 *
 * `baseline` maps a `src/`-relative path to the foreign writes it may still make per model.
 * A file over its allowance fails, and so does one under it — the entry must then be lowered,
 * so the baseline can only shrink.
 */
export function createWriteOwnershipRule({ srcRoot, schemaPath, owners, baseline }) {
  const models = readSchemaModels(schemaPath)

  return {
    meta: {
      type: 'problem',
      docs: { description: 'Only the owning module writes a Prisma model' },
      messages: {
        foreignWrite:
          '`{{model}}` is owned by {{owners}}; `{{scope}}` must not write it directly. Call the owner’s service instead (map: oxlint/data-ownership.mjs).',
        unowned: '`{{model}}` has no owner in oxlint/data-ownership.mjs.',
        staleBaseline:
          'oxlint/data-ownership-baseline.json allows {{allowed}} direct `{{model}}` write(s) here but {{found}} remain. Lower the entry to {{found}}.',
      },
    },
    create(context) {
      const scope = scopeOf(srcRoot, context.filename)
      if (scope === undefined) return {}
      const file = relative(srcRoot, context.filename).split(sep).join('/')
      const allowance = baseline[file] ?? {}
      /** Foreign writes found in this file, by model. */
      const foreign = new Map()

      return {
        CallExpression(node) {
          const method = propertyName(node.callee)
          if (method === undefined || !WRITE_METHODS.has(method)) return
          const model = propertyName(node.callee.object)
          if (model === undefined || !models.has(model)) return

          const allowed = owners[model]
          if (allowed === undefined) {
            context.report({ node: node.callee, messageId: 'unowned', data: { model } })
            return
          }
          if (allowed.includes(scope)) return
          const nodes = foreign.get(model) ?? []
          nodes.push(node.callee)
          foreign.set(model, nodes)
        },

        'Program:exit'(program) {
          for (const [model, nodes] of foreign) {
            if (nodes.length <= (allowance[model] ?? 0)) continue
            for (const node of nodes) {
              context.report({
                node,
                messageId: 'foreignWrite',
                data: {
                  model,
                  scope,
                  owners: owners[model].map((owner) => `\`${owner}\``).join(', '),
                },
              })
            }
          }
          for (const [model, allowed] of Object.entries(allowance)) {
            const found = foreign.get(model)?.length ?? 0
            if (found >= allowed) continue
            context.report({
              node: program,
              messageId: 'staleBaseline',
              data: { model, allowed: String(allowed), found: String(found) },
            })
          }
        },
      }
    },
  }
}

/** The multi-file schema folder when it exists, otherwise the single `schema.prisma`. */
export const API_SCHEMA_PATH = existsSync(join(apiRoot, 'prisma', 'schema'))
  ? join(apiRoot, 'prisma', 'schema')
  : join(apiRoot, 'prisma', 'schema.prisma')

const baseline = JSON.parse(
  readFileSync(join(apiRoot, 'oxlint', 'data-ownership-baseline.json'), 'utf8'),
)

export default {
  meta: { name: 'bitrate-api' },
  rules: {
    'prisma-write-ownership': createWriteOwnershipRule({
      srcRoot: join(apiRoot, 'src'),
      schemaPath: API_SCHEMA_PATH,
      owners: DATA_OWNERS,
      baseline,
    }),
  },
}
