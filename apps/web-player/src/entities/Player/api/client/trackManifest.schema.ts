import { z } from 'zod'

const nonNegativeInteger = z.number().int().nonnegative()
const positiveInteger = z.number().int().positive()

/** `[startTicks, durationTicks, offset, length]` */
const fragmentSchema = z.tuple([
  nonNegativeInteger,
  positiveInteger,
  nonNegativeInteger,
  positiveInteger,
])

const inclusiveRangeSchema = z
  .tuple([nonNegativeInteger, nonNegativeInteger])
  .refine(([start, end]) => end >= start, 'Range end must not precede start')
  .refine(([start]) => start === 0, 'Initialization range must start at zero')

const renditionSchema = z
  .object({
    bitrate: positiveInteger,
    codec: z.string().trim().min(1),
    size: positiveInteger,
    initRange: inclusiveRangeSchema,
    fragments: z.array(fragmentSchema).min(1),
  })
  .superRefine((rendition, context) => {
    if (rendition.initRange[1] >= rendition.size) {
      context.addIssue({
        code: 'custom',
        message: 'Initialization range exceeds rendition size',
        path: ['initRange'],
      })
    }

    let previousEndTicks = 0
    let previousByteEnd = rendition.initRange[1]
    for (const [index, fragment] of rendition.fragments.entries()) {
      const [startTicks, durationTicks, offset, length] = fragment
      if (startTicks !== previousEndTicks) {
        context.addIssue({
          code: 'custom',
          message: 'Fragment timelines must be contiguous and start at zero',
          path: ['fragments', index],
        })
      }

      const byteEndExclusive = offset + length
      if (
        !Number.isSafeInteger(byteEndExclusive) ||
        byteEndExclusive > rendition.size
      ) {
        context.addIssue({
          code: 'custom',
          message: 'Fragment byte range exceeds rendition size',
          path: ['fragments', index],
        })
      }
      if (offset <= previousByteEnd) {
        context.addIssue({
          code: 'custom',
          message: 'Fragment byte ranges must be ordered and non-overlapping',
          path: ['fragments', index],
        })
      }

      const endTicks = startTicks + durationTicks
      if (!Number.isSafeInteger(endTicks)) {
        context.addIssue({
          code: 'custom',
          message: 'Fragment timeline exceeds safe integer precision',
          path: ['fragments', index],
        })
      }
      previousEndTicks = endTicks
      previousByteEnd = byteEndExclusive - 1
    }
  })

export const trackManifestSchema = z
  .object({
    version: z.literal(1),
    timescale: positiveInteger,
    durationTicks: positiveInteger,
    durationMs: positiveInteger,
    renditions: z.array(renditionSchema).min(1),
  })
  .superRefine((manifest, context) => {
    const expectedDurationMs =
      (manifest.durationTicks / manifest.timescale) * 1000
    if (Math.abs(expectedDurationMs - manifest.durationMs) > 1) {
      context.addIssue({
        code: 'custom',
        message: 'Manifest durations are inconsistent',
        path: ['durationMs'],
      })
    }

    const reference = manifest.renditions[0]
    const seenBitrates = new Set<number>()
    for (const [renditionIndex, rendition] of manifest.renditions.entries()) {
      if (seenBitrates.has(rendition.bitrate)) {
        context.addIssue({
          code: 'custom',
          message: 'Rendition bitrates must be unique',
          path: ['renditions', renditionIndex, 'bitrate'],
        })
      }
      seenBitrates.add(rendition.bitrate)

      const previousRendition = manifest.renditions[renditionIndex - 1]
      if (previousRendition && rendition.bitrate <= previousRendition.bitrate) {
        context.addIssue({
          code: 'custom',
          message: 'Renditions must be ordered by increasing bitrate',
          path: ['renditions', renditionIndex, 'bitrate'],
        })
      }

      if (!reference || renditionIndex === 0) continue
      if (rendition.codec !== reference.codec) {
        context.addIssue({
          code: 'custom',
          message: 'All renditions must use the same codec',
          path: ['renditions', renditionIndex, 'codec'],
        })
      }
      if (rendition.fragments.length !== reference.fragments.length) {
        context.addIssue({
          code: 'custom',
          message: 'Renditions must have aligned fragment counts',
          path: ['renditions', renditionIndex, 'fragments'],
        })
        continue
      }

      for (const [fragmentIndex, fragment] of rendition.fragments.entries()) {
        const referenceFragment = reference.fragments[fragmentIndex]
        if (
          !referenceFragment ||
          fragment[0] !== referenceFragment[0] ||
          fragment[1] !== referenceFragment[1]
        ) {
          context.addIssue({
            code: 'custom',
            message: 'Rendition fragment timelines must be aligned',
            path: ['renditions', renditionIndex, 'fragments', fragmentIndex],
          })
        }
      }
    }

    for (const [renditionIndex, rendition] of manifest.renditions.entries()) {
      const lastFragment = rendition.fragments.at(-1)
      if (
        !lastFragment ||
        lastFragment[0] + lastFragment[1] !== manifest.durationTicks
      ) {
        context.addIssue({
          code: 'custom',
          message: 'Rendition timeline must cover the manifest duration',
          path: ['renditions', renditionIndex, 'fragments'],
        })
      }
    }
  })
