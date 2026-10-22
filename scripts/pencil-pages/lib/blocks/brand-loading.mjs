// Library page blocks: brand mark, loaders, progress and skeletons.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { C, T, I, F, Row, Col, Ref, id } from '../../kit.mjs'
import { reg, part, comp, gradient } from '../engine.mjs'

/* the real Bitrate mark as a vector (packages/ui-react/assets/icons/logo-icon.svg) and its write-on loader keyframes.
   The motion (brush mask along the ribbon spines, contour pulse, erase) lives in the prototypes; Pencil shows keyframes. */
const LOGO_SVG = readFileSync(
  join(
    dirname(new URL(import.meta.url).pathname),
    '../../../../packages/ui-react/assets/icons/logo-icon.svg',
  ),
  'utf8',
)
const LOGO_D = LOGO_SVG.match(/ d="([^"]+)"/)[1]
const LOGO_BOX = [371, 117, 795, 775]
const SPINE_A_HEAD =
  'M 405 152 C 430 200 470 211 560 211 L 900 211 C 1010 211 1050 280 1050 350 C 1050 430 990 493 900 493'
const TAILS = 'M 720 493 C 560 493 470 600 425 780 M 900 805 L 640 805 C 580 805 540 830 512 868'
const brand = {
  type: 'gradient',
  gradientType: 'linear',
  rotation: 90,
  colors: [
    { color: C.gradientPrimaryFrom, position: 0 },
    { color: C.gradientPrimaryTo, position: 1 },
  ],
}
const vec = (name, geometry, w, o = {}) => ({
  type: 'path',
  id: id(),
  name,
  geometry,
  viewBox: LOGO_BOX,
  width: w,
  height: Math.round((w * 775) / 795),
  ...o,
})
/* loading: brand loader, spinners, progress, statuses and skeleton rows that mirror each long list */
const sk = (w, h = 12, o = {}) => Ref('Jjegi', { name: 'Skeleton', width: w, height: h, ...o })
const skCircle = (d) => sk(d, d, { cornerRadius: d / 2 })
const track = (name, w, fillW, fill = gradient(C.primary, C.magenta500, 90)) =>
  F({ name, width: w, height: 4, cornerRadius: 2, fill: C.muted }, [
    part('progress', F({ name: 'Fill', width: fillW, height: 4, cornerRadius: 2, fill })),
  ])
const loadPill = (name, fill, stroke, text, icon, label) =>
  comp(
    name,
    Row(
      {
        name: 'Status',
        height: 24,
        padding: [0, 10],
        gap: 6,
        cornerRadius: 12,
        fill,
        stroke,
        strokeWidth: 1,
      },
      [
        I(icon, { width: 12, height: 12, fill: text }),
        part('label', T(label, { fontSize: 12, fontWeight: '600', fill: text })),
      ],
    ),
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    comp('Logo/Mark Path', vec('Mark', LOGO_D, 72, { fill: brand })),
    comp('Loader/Logo Write', vec('Write', SPINE_A_HEAD, 120, { stroke: brand, strokeWidth: 16 })),
    comp(
      'Loader/Logo Pulse',
      vec('Pulse', LOGO_D, 120, { fill: brand, stroke: C.accent, strokeWidth: 2 }),
    ),
    comp('Loader/Logo Erase', vec('Erase', TAILS, 120, { stroke: brand, strokeWidth: 16 })),
    comp(
      'Loader/Logo Mini',
      vec('Mini', LOGO_D, 24, { fill: C.muted, stroke: C.primary, strokeWidth: 1.5 }),
    ),
  )

  add(
    comp(
      'Loader/Signal',
      Col({ name: 'Loader', gap: 14, alignItems: 'center' }, [
        Row(
          { name: 'Bars', gap: 5, alignItems: 'end', height: 44 },
          [16, 30, 44, 30, 16].map((h, i) =>
            F({
              name: `Bar ${i + 1}`,
              width: 6,
              height: h,
              cornerRadius: 3,
              fill: gradient(C.primary, C.magenta500, 180),
            }),
          ),
        ),
        part('label', T('Loading…', { fontSize: 13, fill: C.mutedForeground })),
      ]),
    ),
    comp(
      'Loader/Spinner',
      part('icon', I('loader-circle', { width: 24, height: 24, fill: C.primary })),
    ),
    comp(
      'Loader/Spinner Small',
      part('icon', I('loader-circle', { width: 16, height: 16, fill: C.mutedForeground })),
    ),
  )
  add(
    comp(
      'Loader/Splash',
      Col({ name: 'Splash', width: 360, gap: 28, alignItems: 'center' }, [
        Ref(reg['Loader/Logo Pulse'].id, { name: 'Logo Loader' }),
        T('Bitrate', { fontFamily: 'font-heading', fontSize: 26, fontWeight: '700' }),
        Col({ name: 'Progress', gap: 10, width: 240, alignItems: 'center' }, [
          track('Track', 240, 140),
          part(
            'label',
            T('Connecting to your library…', { fontSize: 13, fill: C.mutedForeground }),
          ),
        ]),
      ]),
    ),
    comp(
      'Progress/Route Bar',
      F({ name: 'Route Bar', width: 'fill_container', height: 3 }, [
        part(
          'progress',
          F({
            name: 'Fill',
            width: 620,
            height: 3,
            cornerRadius: 2,
            fill: gradient(C.primary, C.magenta500, 90),
          }),
        ),
      ]),
      { cell: 'wide' },
    ),
    comp(
      'Seek Bar/Buffering',
      Col({ name: 'Seek Bar', width: 'fill_container', gap: 8 }, [
        Row({ name: 'Rail', width: 'fill_container', height: 12, gap: 0, alignItems: 'center' }, [
          part(
            'elapsedBar',
            F({ name: 'Elapsed', width: 160, height: 4, cornerRadius: 2, fill: C.primary }),
          ),
          F({ name: 'Thumb', width: 12, height: 12, cornerRadius: 6, fill: C.foreground }),
          part(
            'bufferedBar',
            F({ name: 'Buffered', width: 90, height: 4, cornerRadius: 2, fill: C.mutedForeground }),
          ),
          F({
            name: 'Remaining',
            width: 'fill_container',
            height: 4,
            cornerRadius: 2,
            fill: C.surface,
          }),
        ]),
        Row({ name: 'Times', width: 'fill_container', justifyContent: 'space_between' }, [
          part('elapsed', T('1:48', { fontSize: 12, fill: C.mutedForeground })),
          Row({ name: 'Buffering', gap: 6 }, [
            I('loader-circle', { width: 12, height: 12, fill: C.accent }),
            part('label', T('Buffering…', { fontSize: 12, fontWeight: '600', fill: C.accent })),
          ]),
          part('duration', T('3:42', { fontSize: 12, fill: C.mutedForeground })),
        ]),
      ]),
      { cell: 'medium' },
    ),
    loadPill('Status/Loading', C.muted, C.border, C.mutedForeground, 'loader-circle', 'Loading'),
    loadPill('Status/Syncing', C.infoSurface, C.infoBorder, C.infoText, 'refresh-cw', 'Syncing'),
    loadPill(
      'Status/Queued',
      C.warningSurface,
      C.warningBorder,
      C.warningText,
      'cloud-off',
      'Queued offline',
    ),
    comp(
      'List/Load More',
      Row(
        {
          name: 'Load More',
          width: 'fill_container',
          padding: [16, 0],
          gap: 10,
          justifyContent: 'center',
        },
        [
          I('loader-circle', { width: 16, height: 16, fill: C.primary }),
          part('label', T('Loading more…', { fontSize: 13, fill: C.mutedForeground })),
          part('count', T('50 of 1,240', { fontSize: 12, fill: C.textSubdued })),
        ],
      ),
      { cell: 'medium' },
    ),
    comp(
      'List/End',
      Row(
        {
          name: 'List End',
          width: 'fill_container',
          padding: [16, 0],
          gap: 12,
          justifyContent: 'center',
        },
        [
          F({ name: 'Rule', width: 40, height: 1, fill: C.border }),
          part(
            'label',
            T("That's everything · 1,240 tracks", { fontSize: 12, fill: C.textSubdued }),
          ),
          F({ name: 'Rule', width: 40, height: 1, fill: C.border }),
        ],
      ),
      { cell: 'medium' },
    ),
    comp(
      'Toast/Progress',
      Col(
        {
          name: 'Toast',
          width: 360,
          padding: 16,
          gap: 12,
          cornerRadius: 12,
          fill: C.popover,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          Row({ name: 'Head', width: 'fill_container', gap: 10, alignItems: 'start' }, [
            I('loader-circle', { width: 18, height: 18, fill: C.primary }),
            Col({ gap: 2, width: 'fill_container' }, [
              part('title', T('Saving playlist…', { fontWeight: '600', fontSize: 14 })),
              part('desc', T('3 of 12 tracks', { fontSize: 12, fill: C.mutedForeground })),
            ]),
            part(
              'action',
              T('Cancel', { fontSize: 13, fontWeight: '600', fill: C.mutedForeground }),
            ),
          ]),
          track('Track', 'fill_container', 90, C.primary),
        ],
      ),
    ),
    comp('Skeleton/Shimmer', sk(280, 12, { fill: gradient(C.muted, C.secondary, 90) })),
    comp(
      'Skeleton/Track Row',
      Row({ name: 'Track Row', width: 'fill_container', height: 56, padding: [0, 16], gap: 16 }, [
        sk(16, 10),
        sk(40, 40, { cornerRadius: 6 }),
        Col({ gap: 8, width: 'fill_container' }, [sk(220), sk(140, 10)]),
        sk(160, 10),
        sk(80, 10),
        sk(36, 10),
      ]),
      { cell: 'wide' },
    ),
    comp(
      'Skeleton/Track Row Mobile',
      Row({ name: 'Track Row', width: 'fill_container', gap: 12 }, [
        sk(48, 48, { cornerRadius: 6 }),
        Col({ gap: 8, width: 'fill_container' }, [sk(170), sk(110, 10)]),
        skCircle(20),
      ]),
    ),
    comp(
      'Skeleton/Chart Row',
      Row({ name: 'Chart Row', width: 'fill_container', height: 56, padding: [0, 16], gap: 16 }, [
        sk(20, 14),
        sk(14, 14),
        sk(40, 40, { cornerRadius: 6 }),
        Col({ gap: 8, width: 'fill_container' }, [sk(200), sk(120, 10)]),
        sk(70, 10),
        sk(36, 10),
      ]),
      { cell: 'wide' },
    ),
    comp(
      'Skeleton/Card',
      Col({ name: 'Card', gap: 10, width: 168 }, [
        sk(168, 168, { cornerRadius: 8 }),
        sk(130),
        sk(90, 10),
      ]),
    ),
    comp(
      'Skeleton/Artist Card',
      Col({ name: 'Artist Card', gap: 10, width: 168, alignItems: 'center' }, [
        skCircle(168),
        sk(110),
        sk(70, 10),
      ]),
    ),
    comp(
      'Skeleton/Person Row',
      Row({ name: 'Person Row', width: 'fill_container', padding: [10, 0], gap: 12 }, [
        skCircle(44),
        Col({ gap: 8, width: 'fill_container' }, [sk(160), sk(110, 10)]),
        sk(88, 32, { cornerRadius: 8 }),
      ]),
      { cell: 'wide' },
    ),
    comp(
      'Skeleton/Notification Row',
      Row({ name: 'Notification Row', width: 'fill_container', padding: [12, 12], gap: 12 }, [
        skCircle(36),
        Col({ gap: 8, width: 'fill_container' }, [sk(320), sk(80, 10)]),
      ]),
      { cell: 'wide' },
    ),
    comp(
      'Skeleton/Table Row',
      Row({ name: 'Table Row', width: 'fill_container', height: 52, padding: [0, 16], gap: 24 }, [
        sk(36, 36, { cornerRadius: 6 }),
        Col({ gap: 6, width: 'fill_container' }, [sk(200), sk(120, 10)]),
        sk(90, 10),
        sk(70, 22, { cornerRadius: 11 }),
        sk(60, 10),
      ]),
      { cell: 'wide' },
    ),
  )
}
