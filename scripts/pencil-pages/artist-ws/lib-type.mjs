// Foundations of the artist library: Poppins type (workspace sizes from workspace.css), the Bitrate
// mark and lockup, avatar, divider, skeleton, spinner and the phone status bar.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { C, Col, F, I, id, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

/* name → [size, weight, colour role, letter spacing] */
const TYPE = {
  Display: [28, '500', 'artistForeground', -0.6],
  H1: [22, '500', 'artistForeground', -0.3],
  H2: [15, '500', 'artistForeground', 0],
  H3: [13, '500', 'artistForeground', 0],
  Body: [12, '400', 'artistForeground', 0],
  'Body Strong': [12, '500', 'artistForeground', 0],
  Muted: [11, '400', 'artistTextSecondary', 0],
  Caption: [10, '400', 'artistTextSecondary', 0],
  Eyebrow: [9, '500', 'artistTextSecondary', 0.8],
  Figure: [36, '500', 'artistForeground', -0.7],
  Link: [11, '500', 'artistIcon', 0],
  Error: [11, '400', 'artistStatusError', 0],
  /* public pages: landing display sizes, the auth card title, the one-time code and legal reading text */
  Hero: [56, '600', 'artistForeground', -1.6],
  'Hero Accent': [56, '600', 'artistIcon', -1.6],
  Section: [40, '600', 'artistForeground', -1],
  'Section Accent': [40, '600', 'artistIcon', -1],
  Lead: [16, '400', 'artistTextSecondary', 0],
  Title: [26, '500', 'artistForeground', -0.4],
  Code: [28, '500', 'artistForeground', 8],
  Reading: [14, '400', 'artistForeground', 0],
}

/** Adds the type styles and the small primitives to the library. */
export function addType(lib, root) {
  const { comp, part, add, use } = lib
  const paint = artistPaint()
  for (const [name, [fontSize, fontWeight, role, letterSpacing]] of Object.entries(TYPE))
    add(
      comp(
        `Text/${name}`,
        part(
          'text',
          T(name === 'Eyebrow' ? 'EYEBROW' : name, {
            fontSize,
            fontWeight,
            fill: C[role],
            letterSpacing,
            lineHeight: 1.5,
          }),
        ),
      ),
    )
  const svg = readFileSync(join(root, 'apps/web-artists/public/bitrate-logo.svg'), 'utf8')
  const viewBox = svg
    .match(/viewBox="([^"]+)"/)[1]
    .split(/\s+/)
    .map(Number)
  const geometry = [...svg.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => m[1]).join(' ')
  add(
    comp(
      'Logo/Mark',
      F({ name: 'Mark', width: 32, height: 32, layout: 'vertical' }, [
        {
          type: 'path',
          id: id(),
          name: 'Mark Path',
          width: 32,
          height: 32,
          geometry,
          viewBox,
          fill: paint.linear(90, [
            [C.gradientBrandFrom, 0],
            [C.gradientBrandTo, 1],
          ]),
        },
      ]),
    ),
  )
  add(
    comp(
      'Logo/Lockup',
      Row({ name: 'Lockup', gap: 12, alignItems: 'start' }, [
        use('Logo/Mark', { name: 'Mark' }),
        Col({ name: 'Wordmark', gap: 0 }, [
          T('Bitrate', { fontSize: 22, lineHeight: 1.3, fill: C.artistForeground }),
          part(
            'sub',
            T('FOR ARTISTS', { fontSize: 10, lineHeight: 1.5, fill: C.artistTextSecondary }),
          ),
        ]),
      ]),
    ),
    comp(
      'Avatar',
      Row(
        {
          name: 'Avatar',
          width: 36,
          height: 36,
          cornerRadius: 18,
          justifyContent: 'center',
          fill: C.artistSelection,
        },
        [part('initials', T('DA', { fontSize: 12, fontWeight: '500', fill: C.artistIcon }))],
      ),
    ),
    comp(
      'Divider',
      F({ name: 'Divider', width: 'fill_container', height: 1, fill: C.artistReleaseBorder }),
    ),
    comp(
      'Skeleton',
      F({
        name: 'Skeleton',
        width: 160,
        height: 12,
        cornerRadius: 6,
        fill: paint.tint(C.artistForeground, 0.08),
      }),
    ),
    comp(
      'Spinner',
      part('icon', I('loader-circle', { width: 16, height: 16, fill: C.artistIcon })),
    ),
    comp(
      'Status Bar',
      Row(
        {
          name: 'Status Bar',
          width: 390,
          height: 47,
          padding: [4, 30, 0, 36],
          justifyContent: 'space_between',
        },
        [
          T('9:41', { fontSize: 15, fontWeight: '600', fill: C.artistForeground }),
          Row({ gap: 6 }, [
            I('signal', { width: 17, height: 17, fill: C.artistForeground }),
            I('wifi', { width: 17, height: 17, fill: C.artistForeground }),
            I('battery-full', { width: 22, height: 17, fill: C.artistForeground }),
          ]),
        ],
      ),
    ),
  )
  return paint
}
