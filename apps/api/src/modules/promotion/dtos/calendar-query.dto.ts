import { z } from 'zod'
import { calendarWindow, isValidCalendarWindow } from '../calendar/calendar-window'
import { PROMOTION_VALIDATION } from '../promotion.errors'

export const CalendarQuerySchema = z
  .strictObject({
    from: z.coerce.date().optional().describe('Start, inclusive; defaults to 7 days ago'),
    to: z.coerce.date().optional().describe('End, exclusive; defaults to 63 days after `from`'),
  })
  .transform((query) => calendarWindow(query))
  .refine(isValidCalendarWindow, {
    message: PROMOTION_VALIDATION.CALENDAR_WINDOW,
    path: ['to'],
  })
export type CalendarQuery = z.infer<typeof CalendarQuerySchema>
