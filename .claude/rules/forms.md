---
name: forms
description: React Hook Form + Zod conventions for apps/web-player — where a schema lives so it is never duplicated, zodResolver setup, register versus Controller, mapping server validation errors onto fields, field arrays, async validation, and the accessibility contract every field must meet. Use whenever writing or reviewing a form, a validation schema, or a field component in the web player.
license: MIT
metadata:
  author: lordpluha
  version: "1.0.0"
---

# Form layer — web-player

React Hook Form + Zod. Used in `features/AuthModal`, `features/Login`, `features/Registration` and any future form-bearing slice. Read before writing a form component.

## Schema location

Schemas live in `entities/<entity>/model/<entity>.schema.ts` (the `.schema.ts` suffix from `typescript.md`). Schema files import only `zod` — no React, no RHF imports. Pure schemas are reusable across features without pulling in the RHF runtime.

```ts
// entities/User/model/auth.schema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export type LoginValues = z.infer<typeof loginSchema>
```

Infer the TypeScript type via `z.infer` — no separate interface needed.

## Form setup — `zodResolver`

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/entities/User/model/auth.schema'

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    // values are already validated by Zod at this point
    await loginMutation(values)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      ...
    </form>
  )
}
```

## Controlled fields

Use `register` for simple native inputs, `Controller` for custom components:

```tsx
// Simple native input
<input
  type="email"
  {...form.register('email')}
  aria-invalid={!!form.formState.errors.email}
/>
{form.formState.errors.email && (
  <span role="alert">{form.formState.errors.email.message}</span>
)}

// Custom component via Controller
<Controller
  name="country"
  control={form.control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      ...
    </Select>
  )}
/>
```

## Validation mode

Default: `mode: 'onTouched'`, `reValidateMode: 'onChange'`. Fields don't show errors until touched; after touch they react on every keystroke. Override `mode` when a wizard step needs eager validation.

## Server errors — mapping to fields

When a mutation returns validation errors from the API, map them to RHF fields:

```ts
try {
  await loginMutation(values)
} catch (error) {
  if (error instanceof AxiosError && error.response?.status === 422) {
    const serverErrors = error.response.data.errors as Record<string, string>
    Object.entries(serverErrors).forEach(([field, message]) => {
      form.setError(field as keyof LoginValues, { type: 'server', message })
    })
  }
}
```

## Schema co-location rule

Never duplicate a schema between features. If two features both validate the same entity shape, the schema lives in `entities/<entity>/model/` and both features import it:

```ts
// ✓ Both features import from entities
import { loginSchema } from '@/entities/User'

// ✗ Duplicate schema defined separately in each feature
```

## Zod patterns

```ts
// Optional fields
z.string().optional()

// Nullable
z.string().nullable()

// Custom error messages
z.string().min(1, { message: 'Required' })

// Dependent validation
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)

// Preprocess (trim whitespace before validation)
z.preprocess((val) => String(val).trim(), z.string().min(1))
```

## Accessibility

- Every input has an associated `<label>` via `htmlFor` or by wrapping.
- Bind `aria-invalid` to the field's error state.
- Error messages use `role="alert"` so screen readers announce them.
- Required fields carry `aria-required="true"` or use a visible asterisk.

## Shared form composition

Inspect existing `@spotify/ui-react` form/input exports before building field markup.
Use `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`,
`FormMessage`, `InputGroup`, and specialised controls when they fit.

A feature-local wrapper may bind a repeated domain field to RHF. Do not create a second
generic form system.

## Form shell and actions

- The native `<form>` owns submission semantics.
- Group primary submit and secondary cancel actions consistently.
- Pending submission prevents duplicate submits and exposes a loading state.
- Keep custom actions explicit when a flow differs from the generic shell.

## Async validation

- Debounce remote validation and ignore/cancel stale responses.
- Zod remains the synchronous shape contract.
- Availability/uniqueness failures use `setError(..., { type: 'server' })`.
- Clear stale server errors when a new value or successful validation supersedes them.

## Field arrays

Use `useFieldArray` for dynamic lists. Render with the generated field id as the React key,
never the array index. Extract a row component when it owns non-trivial actions/validation.

## Common gotchas

- Do not duplicate default values across schema, hook, and conditional branches.
- Validate/map server field names before treating them as form keys.
- Placeholder text is not a label.
- Do not trigger submission mutations from `useEffect`.
- Do not store server-backed form values in Zustand unless they are an explicit cross-route
  draft.
