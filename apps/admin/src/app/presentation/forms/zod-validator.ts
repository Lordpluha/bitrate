import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'
import type { ZodType } from 'zod'

/** Key the distributed messages are stored under, so this validator only ever clears its own. */
const ZOD_ERROR_KEY = 'zod'

type ZodErrorPayload = { message: string }

/**
 * Bridges a zod schema into Reactive Forms, so a schema stays the single source of truth for a
 * shape the way it already is in `apps/api`, `apps/web-player` and `apps/web-artists`. There is
 * no `zodResolver` for Angular; this is the whole adapter.
 *
 * Attach it to the `FormGroup`, not to individual controls — cross-field rules (`.refine`) can
 * only be evaluated against the whole value.
 *
 * Errors are written to child controls under a single `zod` key and cleared again on the next
 * run, with `emitEvent: false` so writing them does not schedule another validation pass.
 */
export function zodValidator(schema: ZodType): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(group.value)

    if (result.success) {
      clearZodErrors(group)
      return null
    }

    clearZodErrors(group)

    /** Issues whose path does not name a control — cross-field rules — stay on the group. */
    const groupIssues: string[] = []

    for (const issue of result.error.issues) {
      const [field] = issue.path
      const child = typeof field === 'string' ? group.get(field) : null

      if (!child) {
        groupIssues.push(issue.message)
        continue
      }

      /** First issue per field wins, matching how the other apps surface one message at a time. */
      if (child.errors?.[ZOD_ERROR_KEY]) continue

      child.setErrors(
        { ...child.errors, [ZOD_ERROR_KEY]: { message: issue.message } },
        {
          emitEvent: false,
        },
      )
    }

    return groupIssues.length > 0 ? { [ZOD_ERROR_KEY]: { message: groupIssues[0] } } : null
  }
}

/** Reads the message this validator put on a control, if any. */
export function zodErrorMessage(control: AbstractControl | null): string | null {
  const payload = control?.errors?.[ZOD_ERROR_KEY] as ZodErrorPayload | undefined

  return payload?.message ?? null
}

function clearZodErrors(group: AbstractControl): void {
  const children = (group as { controls?: Record<string, AbstractControl> }).controls
  if (!children) return

  for (const child of Object.values(children)) {
    if (!child.errors?.[ZOD_ERROR_KEY]) continue

    const { [ZOD_ERROR_KEY]: _removed, ...rest } = child.errors
    child.setErrors(Object.keys(rest).length > 0 ? rest : null, { emitEvent: false })
  }
}
