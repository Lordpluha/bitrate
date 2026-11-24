// Sign-in and sign-up pieces of the public artist pages (features/login, registration, verify-email):
// the glass auth card, the "or" divider, consent checkboxes, password rules and the social buttons with
// the Google and Facebook marks (paths from @bitrate/ui-react, inked in the foreground token).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { C, Col, F, I, id, Row, T } from '../kit.mjs'
import { artistPaint } from './paint.mjs'

const ICONS = 'packages/ui-react/src/icons/svgr'

/** The path data and view box of one svgr icon, joined into a single geometry. */
const svgrMark = (root, file) => {
  const src = readFileSync(join(root, ICONS, file), 'utf8')
  const viewBox = src
    .match(/viewBox="([^"]+)"/)[1]
    .split(/\s+/)
    .map(Number)
  const geometry = [...src.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]).join(' ')
  return { viewBox, geometry }
}

/** Adds the auth card, divider, consent checks, password rules and social buttons. */
export function addAuth(lib, root) {
  const { comp, part, add, slot, use } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  add(
    comp(
      'Auth/Card',
      Col(
        {
          name: 'Auth Card',
          width: 440,
          gap: 20,
          padding: [40, 40],
          cornerRadius: 16,
          ...paint.releaseGlass(),
        },
        [
          /* forgot/reset password have no logo and a left-aligned title: pages switch `head`/`logo` */
          part(
            'head',
            Col({ name: 'Head', gap: 10, width: 'fill_container', alignItems: 'center' }, [
              part('logo', use('Logo/Mark', { name: 'Mark' })),
              part(
                'title',
                T('Welcome back!', {
                  name: 'Title',
                  fontSize: 26,
                  fontWeight: '500',
                  fill: C.artistForeground,
                  textAlign: 'center',
                  ...wrap,
                }),
              ),
              part(
                'desc',
                T('Description', {
                  fontSize: 12,
                  fill: C.artistTextSecondary,
                  textAlign: 'center',
                  ...wrap,
                }),
              ),
            ]),
          ),
          slot('body', { gap: 14 }),
        ],
      ),
    ),
    comp(
      'Auth/Or',
      Row({ name: 'Or', width: 320, gap: 12 }, [
        F({ name: 'Line', width: 'fill_container', height: 1, fill: C.artistReleaseBorder }),
        part('label', T('or', { fontSize: 12, fill: C.artistTextSecondary })),
        F({ name: 'Line', width: 'fill_container', height: 1, fill: C.artistReleaseBorder }),
      ]),
    ),
  )
  const box = (state) =>
    Row(
      {
        name: 'Box',
        width: 16,
        height: 16,
        cornerRadius: 4,
        justifyContent: 'center',
        ...(state === 'Checked' ? { fill: paint.action().fill } : paint.control()),
        ...(state === 'Error' ? { stroke: C.artistStatusError, strokeWidth: 1 } : {}),
      },
      state === 'Checked' ? [I('check', { width: 12, height: 12, fill: C.primaryForeground })] : [],
    )
  for (const state of ['', 'Checked', 'Error'])
    add(
      comp(
        state ? `Check/Box ${state}` : 'Check/Box',
        Row({ name: 'Checkbox', width: 320, gap: 10, alignItems: 'start' }, [
          box(state),
          part(
            'label',
            T('I accept the Terms of Use.', { fontSize: 11, fill: C.artistForeground, ...wrap }),
          ),
        ]),
      ),
    )
  for (const [state, icon, ink] of [
    ['Met', 'circle-check', 'artistStatusReady'],
    ['Unmet', 'circle', 'artistTextSecondary'],
  ])
    add(
      comp(
        `Rule/${state}`,
        Row({ name: 'Rule', gap: 8 }, [
          I(icon, { width: 14, height: 14, fill: C[ink] }),
          part(
            'label',
            T('10 characters', {
              fontSize: 11,
              fill: state === 'Met' ? C.artistForeground : C.artistTextSecondary,
            }),
          ),
        ]),
      ),
    )
  const marks = {
    Google: svgrMark(root, 'GoogleIcon.tsx'),
    Facebook: svgrMark(root, 'FacebookArtistIcon.tsx'),
  }
  for (const [brand, mark] of Object.entries(marks)) {
    add(
      comp(
        `Mark/${brand}`,
        F({ name: brand, width: 20, height: 20, layout: 'vertical' }, [
          {
            type: 'path',
            id: id(),
            name: `${brand} Path`,
            width: 20,
            height: 20,
            ...mark,
            fill: C.artistForeground,
          },
        ]),
      ),
    )
    for (const locked of [false, true])
      add(
        comp(
          `Button/${brand}${locked ? ' Locked' : ''}`,
          Row(
            {
              name: 'Social Button',
              width: 360,
              height: 44,
              padding: [0, 16],
              gap: 12,
              cornerRadius: 22,
              ...paint.control(),
              ...(locked ? { opacity: 0.45 } : {}),
            },
            [
              use(`Mark/${brand}`, { name: 'Mark' }),
              part(
                'label',
                T(`Continue with ${brand}`, {
                  fontSize: 13,
                  fontWeight: '500',
                  fill: C.artistForeground,
                  textAlign: 'center',
                  width: 'fill_container',
                  textGrowth: 'fixed-width',
                }),
              ),
              F({ name: 'Balance', width: 20, height: 20 }),
            ],
          ),
        ),
      )
  }
}
