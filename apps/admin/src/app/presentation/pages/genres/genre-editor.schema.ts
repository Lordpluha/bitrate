import * as z from 'zod'

/**
 * Blank is allowed (the API derives the slug / the genre has no colour); otherwise it must match.
 * Messages are transloco keys; the editor translates them on show.
 */
export const genreEditorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'genre.invalid.nameRequired')
    .max(100, 'genre.invalid.nameTooLong'),
  slug: z
    .string()
    .max(100, 'genre.invalid.slugTooLong')
    .refine((value) => value === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: 'genre.invalid.slugFormat',
    }),
  description: z.string().max(1000, 'genre.invalid.descriptionTooLong'),
  color: z.string().refine((value) => value === '' || /^#[0-9a-fA-F]{6}$/.test(value), {
    message: 'genre.invalid.colorFormat',
  }),
})
