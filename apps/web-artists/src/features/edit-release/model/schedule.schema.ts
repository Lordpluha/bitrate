import { messageKey } from '@shared/i18n'
import { z } from 'zod'

const dateSchema = z.iso
  .date()
  .refine((value) => Number(value.slice(0, 4)) >= 1)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/)

export const scheduleSchema = z
  .object({
    planned: z.boolean(),
    date: z.string(),
    time: z.string(),
  })
  .check((ctx) => {
    const values = ctx.value
    // superRefine's addIssue defaulted `input` and `continue: true`; keep both.
    const fail = (message: string, path: PropertyKey[]) =>
      ctx.issues.push({
        code: 'custom',
        message,
        path,
        input: ctx.value,
        continue: true,
      })
    if (!values.planned) return
    if (!dateSchema.safeParse(values.date).success)
      fail(messageKey('editRelease.dateInvalid'), ['date'])
    if (!timeSchema.safeParse(values.time).success)
      fail(messageKey('editRelease.timeInvalid'), ['time'])
  })

export type ScheduleValues = z.infer<typeof scheduleSchema>

export function scheduleDefaults(scheduledAt: string | null): ScheduleValues {
  const instant = scheduledAt ? new Date(scheduledAt).toISOString() : null
  return {
    planned: instant !== null,
    date: instant?.slice(0, 10) ?? '',
    time: instant?.slice(11, 23) ?? '00:00:00.000',
  }
}

export function scheduleInstant(values: ScheduleValues) {
  return values.planned
    ? new Date(`${values.date}T${values.time}Z`).toISOString()
    : null
}
