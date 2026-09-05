---
name: zod
description: Zod schema conventions across the monorepo — nestjs-zod DTOs in apps/api, form schemas and runtime-validated API responses in web-player, where a schema lives so it is not duplicated, and inferring types instead of hand-writing them. Use when writing or changing any Zod schema, a createZodDto DTO, a zodResolver form, or a response validator.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Zod — one schema, inferred types

Zod is the validation layer on both sides of this monorepo: `nestjs-zod` DTOs in
`apps/api`, and form/response schemas in `apps/web-player` and `apps/web-artists`. The rule
that matters most is the same everywhere: **the schema is the source of truth, and the
TypeScript type is inferred from it.**

```ts
export const loginSchema = z.object({ email: z.email(), password: z.string().min(6) })
export type LoginValues = z.infer<typeof loginSchema>
```

A hand-written `interface LoginValues` beside a schema is a bug waiting for someone to edit
one and not the other.

## Where a schema lives

| Use | Location |
|---|---|
| API input DTO | `apps/api/src/modules/<name>/dtos/<action>-<entity>.dto.ts` |
| web-player form / entity shape | `entities/<Entity>/model/schemas/<entity>.schema.ts` |
| Runtime-validated API response | `entities/<Entity>/model/responses/<entity>.response.dto.ts` |

**Never duplicate a schema between two features.** If two features validate the same shape,
the schema belongs in the shared `entities/` slice and both import it through the public
barrel. This is the single most common Zod mistake in an FSD codebase.

Schema files import **only `zod`** — no React, no React Hook Form, no NestJS. A pure schema
is reusable on both sides of a boundary; one that imports a UI library is not.

## apps/api — nestjs-zod

```ts
export const CreateTrackSchema = z.object({
  title: z.string().min(1).max(255),
  duration: z.number().int().positive(),
  artistId: z.string().uuid(),
})

export class CreateTrackDto extends createZodDto(CreateTrackSchema) {}
```

`createZodDto` produces a class Nest can use as a `@Body()` type *and* Swagger can read for
the OpenAPI document. That generated document becomes `@bitrate/contracts`, which the
frontends type against — so **a loose API schema is a loose frontend type**. `z.any()` or a
missing constraint here propagates all the way to the UI.

Validation runs via `ZodValidationPipe` (globally in `main.ts`, or per-handler). A failure
becomes a 400 through the global filter; do not catch and re-shape it by hand.

## web-player — forms

```ts
const form = useForm<LoginValues>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
})
```

Default values are declared once, in the hook. Repeating them inside a conditional branch or
a `reset()` call is how a form drifts out of sync with its schema.

## web-player — validating responses

`@bitrate/contracts` gives compile-time types from the OpenAPI document; it does not check
what the server actually sent at runtime. Where a wrong shape would be dangerous or hard to
debug, parse the response:

```ts
export const trackResponseSchema = z.object({ id: z.string().uuid(), title: z.string() })
export type TrackResponse = z.infer<typeof trackResponseSchema>
```

Use `safeParse` at a boundary you must not throw from, `parse` where a failure genuinely is
a bug. Do not maintain a hand-written duplicate of the response shape beside the schema.

## Patterns worth knowing

```ts
z.string().min(1, { message: 'Required' })          // messages are user-facing copy
z.email()  z.uuid()  z.url()                       // Zod 4 top-level format validators;
                                                   // z.string().email() still parses but is
                                                   // the deprecated v3 spelling
z.string().optional()                                // key may be absent
z.string().nullable()                                // value may be null — not the same thing
z.coerce.number()                                    // query params and form inputs arrive as strings
z.preprocess((v) => String(v).trim(), z.string().min(1))

z.object({ password: z.string().min(8), confirmPassword: z.string() })
 .refine((d) => d.password === d.confirmPassword, {
   message: 'Passwords do not match',
   path: ['confirmPassword'],          // without path, the error attaches to the root
 })
```

`.refine` without `path` produces an error no field can display — that is the usual reason a
"validation silently does nothing" bug appears in a form.

`z.enum([...])` over a TypeScript `enum`: it gives you the runtime validator and the union
type from one declaration.

## Gotchas

- **`.optional()` vs `.nullable()` vs `.nullish()`** — absent, null, and either. Prisma
  returns `null` for a nullable column, never `undefined`; a schema using `.optional()`
  against it will reject valid data.
- **`z.object` strips unknown keys by default.** That is usually what you want for input.
  Use `.passthrough()` deliberately, and `.strict()` when an unexpected key should be an
  error (config, webhooks).
- **Parsing is not free.** Validate at boundaries — request input, external responses — not
  in a render path or a hot loop.
- **Schema composition beats duplication**: `createTrackSchema.partial()`,
  `.pick({...})`, `.omit({...})`, `.extend({...})` derive an update schema from a create
  schema instead of restating it.

## When this skill does not cover it

Do not guess an API from memory. In order:

1. **Read the installed version.** `node_modules/zod` is what this repo actually runs; the
   docs site describes the latest release, which may not be it.
   ```bash
   node -p "require('zod/package.json').version"
   ```
2. **Then the official docs:** https://zod.dev — match them to the version you just read.
3. **If both are silent, say so in your report** rather than inventing an API. Here that
   matters because Zod 4 renamed and re-typed parts of the v3 API.

## Related

- `.claude/rules/forms.md` — React Hook Form + Zod, field wiring, server-error mapping.
- `.claude/rules/api-rules.md` — DTO placement in the API module tree.
- `nestjs` skill — where validation sits in the pipe/guard execution order.
