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
  .check((context) => {
    const rendition = context.value
    // superRefine's addIssue defaulted `input` and `continue: true`; keep both.
    const fail = (message: string, path: PropertyKey[]) =>
      context.issues.push({
        code: 'custom',
        message,
        path,
        input: context.value,
        continue: true,
      })
    if (rendition.initRange[1] >= rendition.size) {
      fail('Initialization range exceeds rendition size', ['initRange'])
    }

    let previousEndTicks = 0
    let previousByteEnd = rendition.initRange[1]
    for (const [index, fragment] of rendition.fragments.entries()) {
      const [startTicks, durationTicks, offset, length] = fragment
      if (startTicks !== previousEndTicks) {
        fail('Fragment timelines must be contiguous and start at zero', [
          'fragments',
          index,
        ])
      }

      const byteEndExclusive = offset + length
      if (
        !Number.isSafeInteger(byteEndExclusive) ||
        byteEndExclusive > rendition.size
      ) {
        fail('Fragment byte range exceeds rendition size', ['fragments', index])
      }
      if (offset <= previousByteEnd) {
        fail('Fragment byte ranges must be ordered and non-overlapping', [
          'fragments',
          index,
        ])
      }

      const endTicks = startTicks + durationTicks
      if (!Number.isSafeInteger(endTicks)) {
        fail('Fragment timeline exceeds safe integer precision', [
          'fragments',
          index,
        ])
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
  .check((context) => {
    const manifest = context.value
    // superRefine's addIssue defaulted `input` and `continue: true`; keep both.
    const fail = (message: string, path: PropertyKey[]) =>
      context.issues.push({
        code: 'custom',
        message,
        path,
        input: context.value,
        continue: true,
      })
    const expectedDurationMs =
      (manifest.durationTicks / manifest.timescale) * 1000
    if (Math.abs(expectedDurationMs - manifest.durationMs) > 1) {
      fail('Manifest durations are inconsistent', ['durationMs'])
    }

    const reference = manifest.renditions[0]
    const seenBitrates = new Set<number>()
    for (const [renditionIndex, rendition] of manifest.renditions.entries()) {
      if (seenBitrates.has(rendition.bitrate)) {
        fail('Rendition bitrates must be unique', [
          'renditions',
          renditionIndex,
          'bitrate',
        ])
      }
      seenBitrates.add(rendition.bitrate)

      const previousRendition = manifest.renditions[renditionIndex - 1]
      if (previousRendition && rendition.bitrate <= previousRendition.bitrate) {
        fail('Renditions must be ordered by increasing bitrate', [
          'renditions',
          renditionIndex,
          'bitrate',
        ])
      }

      if (!reference || renditionIndex === 0) continue
      if (rendition.codec !== reference.codec) {
        fail('All renditions must use the same codec', [
          'renditions',
          renditionIndex,
          'codec',
        ])
      }
      if (rendition.fragments.length !== reference.fragments.length) {
        fail('Renditions must have aligned fragment counts', [
          'renditions',
          renditionIndex,
          'fragments',
        ])
        continue
      }

      for (const [fragmentIndex, fragment] of rendition.fragments.entries()) {
        const referenceFragment = reference.fragments[fragmentIndex]
        if (
          !referenceFragment ||
          fragment[0] !== referenceFragment[0] ||
          fragment[1] !== referenceFragment[1]
        ) {
          fail('Rendition fragment timelines must be aligned', [
            'renditions',
            renditionIndex,
            'fragments',
            fragmentIndex,
          ])
        }
      }
    }

    for (const [renditionIndex, rendition] of manifest.renditions.entries()) {
      const lastFragment = rendition.fragments.at(-1)
      if (
        !lastFragment ||
        lastFragment[0] + lastFragment[1] !== manifest.durationTicks
      ) {
        fail('Rendition timeline must cover the manifest duration', [
          'renditions',
          renditionIndex,
          'fragments',
        ])
      }
    }
  })
