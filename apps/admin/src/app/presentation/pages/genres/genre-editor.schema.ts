import { z } from 'zod'

/** Blank is allowed (the API derives the slug / the genre has no colour); otherwise it must match. */
export const genreEditorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  slug: z
    .string()
    .max(100, 'Slug must be 100 characters or fewer')
    .refine((value) => value === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: 'Use lowercase letters, digits and single hyphens',
    }),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer'),
  color: z.string().refine((value) => value === '' || /^#[0-9a-fA-F]{6}$/.test(value), {
    message: 'Use a #rrggbb colour, e.g. #148a78',
  }),
})
