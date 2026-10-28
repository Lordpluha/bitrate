// Library page blocks: mobile island player.
import { C, T, I, F, Row, Col, img, ART } from '../../kit.mjs'
import { part, comp, gradient } from '../engine.mjs'

/* ---------- mobile island player: navigation that carries playback (prototype: mobile-island) ---------- */
const GLASS = {
  fill: C.card,
  stroke: C.border,
  strokeWidth: 1,
  effect: [
    { type: 'background_blur', radius: 22 },
    { type: 'shadow', shadowType: 'outer', color: C.shadow, offset: { x: 0, y: 18 }, blur: 40 },
  ],
}
const RING_GRAD = gradient(C.magenta500, C.primary, 135)
const islArt = (art = 'afterglow') =>
  F(
    {
      name: 'Artwork',
      width: 50,
      height: 50,
      cornerRadius: 25,
      stroke: RING_GRAD,
      strokeWidth: 2.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    [
      part(
        'art',
        F({ name: 'Cover', width: 40, height: 40, cornerRadius: 20, fill: img(ART[art]) }),
      ),
    ],
  )
const islTab = (key, icon) =>
  part(
    key,
    F(
      {
        name: `Tab ${key}`,
        width: 52,
        height: 52,
        cornerRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [part(`${key}Icon`, I(icon, { width: 20, height: 20, fill: C.mutedForeground }))],
    ),
  )
const islPlay = () =>
  part(
    'play',
    F(
      {
        name: 'Play',
        width: 50,
        height: 50,
        cornerRadius: 25,
        fill: C.foreground,
        justifyContent: 'center',
        alignItems: 'center',
      },
      [part('playIcon', I('pause', { width: 18, height: 18, fill: C.background }))],
    ),
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    comp(
      'Mobile/Island',
      Row(
        {
          name: 'Island',
          width: 358,
          height: 66,
          cornerRadius: 33,
          padding: [0, 8],
          gap: 4,
          ...GLASS,
        },
        [
          islArt(),
          Row(
            {
              name: 'Tabs',
              width: 'fill_container',
              height: 'fill_container',
              justifyContent: 'space_around',
              alignItems: 'center',
            },
            [islTab('home', 'house'), islTab('search', 'search'), islTab('library', 'library')],
          ),
          islPlay(),
        ],
      ),
    ),
    comp(
      'Mobile/Island Compact',
      Row(
        {
          name: 'Island Compact',
          width: 248,
          height: 66,
          cornerRadius: 33,
          padding: [0, 10, 0, 8],
          gap: 10,
          ...GLASS,
        },
        [
          islArt(),
          Col({ name: 'Track', gap: 0, width: 'fill_container' }, [
            part('title', T('Afterglow', { fontSize: 13, fontWeight: '600' })),
            part('artist', T('Nova & the Static', { fontSize: 11, fill: C.mutedForeground })),
          ]),
          part(
            'next',
            F(
              {
                name: 'Next',
                width: 36,
                height: 36,
                cornerRadius: 18,
                fill: C.secondary,
                justifyContent: 'center',
                alignItems: 'center',
              },
              [I('skip-forward', { width: 16, height: 16, fill: C.foreground })],
            ),
          ),
        ],
      ),
    ),
    /* mid-swipe: the current cover slides out of the ring while the neighbour slides in */
    comp(
      'Mobile/Island Skipping',
      Row(
        {
          name: 'Island Skipping',
          width: 358,
          height: 66,
          cornerRadius: 33,
          padding: [0, 8],
          gap: 4,
          ...GLASS,
        },
        [
          F(
            {
              name: 'Artwork',
              width: 50,
              height: 50,
              cornerRadius: 25,
              stroke: RING_GRAD,
              strokeWidth: 2.5,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [
              Row({ name: 'Covers', width: 40, height: 40, cornerRadius: 20, clip: true, gap: 0 }, [
                part(
                  'current',
                  F({ name: 'Current', width: 17, height: 40, fill: img(ART.afterglow) }),
                ),
                part(
                  'neighbour',
                  F({ name: 'Neighbour', width: 23, height: 40, fill: img(ART.static) }),
                ),
              ]),
            ],
          ),
          Row(
            {
              name: 'Tabs',
              width: 'fill_container',
              height: 'fill_container',
              justifyContent: 'space_around',
              alignItems: 'center',
            },
            [islTab('home', 'house'), islTab('search', 'search'), islTab('library', 'library')],
          ),
          islPlay(),
        ],
      ),
    ),
    comp(
      'Mobile/Island Cue',
      Row({ name: 'Cue', height: 28, padding: [0, 12], cornerRadius: 14, ...GLASS }, [
        part(
          'text',
          T('NEXT · STATIC LINES', {
            fontSize: 11,
            letterSpacing: 0.9,
            fontFamily: 'JetBrains Mono',
            fill: C.foreground,
          }),
        ),
      ]),
    ),
    comp(
      'Mobile/Island Live',
      Row(
        {
          name: 'Island Live',
          width: 358,
          height: 78,
          cornerRadius: 39,
          padding: [0, 10, 0, 8],
          gap: 10,
          ...GLASS,
        },
        [
          islArt(),
          part(
            'avatar',
            F({ name: 'Avatar', width: 40, height: 40, cornerRadius: 20, fill: img(ART.avatar2) }),
          ),
          Col({ name: 'Message', gap: 2, width: 'fill_container' }, [
            part('title', T('Jonah joined your Jam', { fontSize: 13, fontWeight: '600' })),
            part(
              'desc',
              T('Listening to Afterglow with you', { fontSize: 11, fill: C.mutedForeground }),
            ),
          ]),
          part(
            'action',
            Row(
              {
                name: 'Action',
                height: 40,
                padding: [0, 14],
                cornerRadius: 20,
                fill: C.primary,
                justifyContent: 'center',
              },
              [
                part(
                  'actionLabel',
                  T('Say hi', { fontSize: 13, fontWeight: '600', fill: C.primaryForeground }),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
    comp(
      'Mobile/Island Actions',
      Row(
        { name: 'Island Actions', width: 358, gap: 8 },
        [
          ['heart', 'Like'],
          ['list-music', 'Queue'],
          ['monitor-speaker', 'Connect'],
          ['moon', 'Sleep'],
        ].map(([icon, label]) =>
          Col(
            {
              name: `Action ${label}`,
              width: 'fill_container',
              height: 64,
              cornerRadius: 20,
              gap: 4,
              justifyContent: 'center',
              alignItems: 'center',
              ...GLASS,
            },
            [
              I(icon, { width: 20, height: 20, fill: C.foreground }),
              T(label, { fontSize: 11, fontWeight: '500' }),
            ],
          ),
        ),
      ),
    ),
    comp(
      'Home/Resume',
      Row(
        {
          name: 'Resume',
          width: 358,
          padding: 16,
          gap: 14,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
          alignItems: 'center',
        },
        [
          part(
            'cover',
            F({ name: 'Cover', width: 92, height: 92, cornerRadius: 16, fill: img(ART.afterglow) }),
          ),
          Col({ name: 'Body', gap: 4, width: 'fill_container' }, [
            part(
              'eyebrow',
              T('RESUME · FROM DESKTOP', {
                fontSize: 10,
                letterSpacing: 1,
                fill: C.mutedForeground,
              }),
            ),
            part(
              'title',
              T('Afterglow', { fontSize: 17, fontWeight: '600', fontFamily: 'font-heading' }),
            ),
            part(
              'meta',
              T('Nova & the Static · 1:48 of 3:42', { fontSize: 12, fill: C.mutedForeground }),
            ),
            Row(
              {
                name: 'Progress',
                width: 'fill_container',
                height: 3,
                cornerRadius: 2,
                fill: C.border,
                padding: [0, 0],
              },
              [
                F({
                  name: 'Done',
                  width: 110,
                  height: 3,
                  cornerRadius: 2,
                  fill: gradient(C.primary, C.magenta500, 90),
                }),
              ],
            ),
            Row(
              {
                name: 'Continue',
                height: 32,
                padding: [0, 12],
                gap: 6,
                cornerRadius: 16,
                fill: C.foreground,
              },
              [
                I('play', { width: 14, height: 14, fill: C.background }),
                part(
                  'cta',
                  T('Continue here', { fontSize: 12, fontWeight: '600', fill: C.background }),
                ),
              ],
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Home/Tuner',
      Col(
        {
          name: 'Tuner',
          width: 358,
          padding: 16,
          gap: 10,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          Row(
            {
              name: 'Station',
              width: 'fill_container',
              justifyContent: 'space_between',
              alignItems: 'end',
            },
            [
              Col({ gap: 4 }, [
                T('TUNE BY FEELING', { fontSize: 10, letterSpacing: 1, fill: C.mutedForeground }),
                part(
                  'station',
                  T('Night · 94.0', {
                    fontSize: 22,
                    fontWeight: '600',
                    fontFamily: 'font-heading',
                  }),
                ),
              ]),
              part(
                'count',
                T('3 PICKS', { fontSize: 10, letterSpacing: 1, fill: C.mutedForeground }),
              ),
            ],
          ),
          Row(
            {
              name: 'Dial',
              width: 'fill_container',
              height: 46,
              justifyContent: 'space_between',
              alignItems: 'end',
            },
            Array.from({ length: 30 }, (_, i) => {
              const near = Math.abs(i - 17) <= 1
              return F({
                name: i === 17 ? 'Needle' : 'Bar',
                width: i === 17 ? 2 : 3,
                height:
                  i === 17
                    ? 46
                    : Math.round(10 + 30 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.23))),
                cornerRadius: 2,
                fill:
                  i === 17 ? gradient(C.magenta500, C.primary, 180) : near ? C.accent : C.border,
              })
            }),
          ),
          Row(
            { name: 'Moods', width: 'fill_container', justifyContent: 'space_between' },
            ['CALM', 'FOCUS', 'NIGHT', 'DRIVE', 'RUSH'].map((m) =>
              T(m, {
                fontSize: 10,
                letterSpacing: 0.6,
                fill: m === 'NIGHT' ? C.foreground : C.textSubdued,
              }),
            ),
          ),
          Row(
            { name: 'Picks', width: 'fill_container', gap: 8 },
            [
              ['pick1', 'night', 'Night Signal', 'Mira Sol'],
              ['pick2', 'afterglow', 'Afterglow', 'Nova & the Static'],
              ['pick3', 'drift', 'Drift Control', 'Mira Sol'],
            ].map(([k, art, t, a]) =>
              Col({ name: 'Pick', width: 'fill_container', gap: 2 }, [
                part(
                  `${k}Cover`,
                  F({
                    name: 'Cover',
                    width: 'fill_container',
                    height: 100,
                    cornerRadius: 12,
                    fill: img(ART[art]),
                  }),
                ),
                part(`${k}Title`, T(t, { fontSize: 12, fontWeight: '600' })),
                T(a, { fontSize: 11, fill: C.mutedForeground }),
              ]),
            ),
          ),
        ],
      ),
    ),
    comp(
      'Home/Tile Friends',
      Col(
        {
          name: 'Friends Now',
          width: 174,
          height: 132,
          padding: 14,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
          justifyContent: 'space_between',
        },
        [
          Row({ gap: 6 }, [
            F({ name: 'Live', width: 7, height: 7, cornerRadius: 4, fill: C.success }),
            part(
              'status',
              T('3 listening now', { fontSize: 11, fontWeight: '600', fill: C.successText }),
            ),
          ]),
          Col({ gap: 6 }, [
            Row(
              { name: 'Faces', gap: -8 },
              ['avatar2', 'avatar3', 'avatar4'].map((a) =>
                F({
                  name: 'Face',
                  width: 28,
                  height: 28,
                  cornerRadius: 14,
                  stroke: C.card,
                  strokeWidth: 2,
                  fill: img(ART[a]),
                }),
              ),
            ),
            part('meta', T("Jonah's Jam · Luma Vale", { fontSize: 12, fill: C.mutedForeground })),
          ]),
        ],
      ),
    ),
    comp(
      'Home/Tile Week',
      Col(
        {
          name: 'Week',
          width: 174,
          height: 132,
          padding: 14,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
          justifyContent: 'space_between',
        },
        [
          T('THIS WEEK', { fontSize: 10, letterSpacing: 1, fill: C.mutedForeground }),
          Row(
            { name: 'Chart', width: 'fill_container', height: 46, gap: 5, alignItems: 'end' },
            [14, 24, 18, 34, 21, 44, 9].map((h, i) =>
              F({
                name: 'Day',
                width: 'fill_container',
                height: h,
                cornerRadius: 4,
                fill: i === 5 ? gradient(C.magenta500, C.primary, 180) : C.border,
              }),
            ),
          ),
          part('meta', T('11 h · mostly at night', { fontSize: 12, fill: C.mutedForeground })),
        ],
      ),
    ),
    comp(
      'Home/Tile Artist Note',
      Row(
        {
          name: 'Artist Note',
          width: 358,
          padding: 14,
          gap: 12,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
          alignItems: 'start',
        },
        [
          part(
            'cover',
            F({ name: 'Cover', width: 44, height: 44, cornerRadius: 12, fill: img(ART.night) }),
          ),
          Col({ gap: 4, width: 'fill_container' }, [
            part(
              'from',
              T('FROM MIRA SOL · NEW SINGLE', {
                fontSize: 10,
                letterSpacing: 1,
                fill: C.mutedForeground,
              }),
            ),
            part(
              'quote',
              T('“Recorded it in one take at 3 am. Play it loud, in the dark.”', {
                fontSize: 13,
                textGrowth: 'fixed-width',
                width: 'fill_container',
                lineHeight: 1.45,
              }),
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Home/Tile Offline',
      Col(
        {
          name: 'Offline',
          width: 174,
          height: 132,
          padding: 14,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
          justifyContent: 'space_between',
        },
        [
          I('download', { width: 20, height: 20, fill: C.accent }),
          Col({ gap: 2 }, [
            part(
              'size',
              T('2.1 GB', { fontSize: 24, fontWeight: '600', fontFamily: 'font-heading' }),
            ),
            part(
              'meta',
              T('Ready offline · 214 tracks', { fontSize: 12, fill: C.mutedForeground }),
            ),
          ]),
        ],
      ),
    ),
    comp(
      'Home/Tile Mix',
      Col(
        {
          name: 'Mix',
          width: 174,
          height: 132,
          padding: 14,
          cornerRadius: 22,
          fill: gradient(C.primary, C.magenta500, 150),
          justifyContent: 'space_between',
        },
        [
          I('sparkles', { width: 20, height: 20, fill: C.white }),
          Col({ gap: 2 }, [
            part(
              'title',
              T('Daily drift', {
                fontSize: 15,
                fontWeight: '600',
                fontFamily: 'font-heading',
                fill: C.white,
              }),
            ),
            part('meta', T("Built from tonight's tuning", { fontSize: 12, fill: C.white })),
          ]),
        ],
      ),
    ),
    comp(
      'Jam/Card',
      Col(
        {
          name: 'Jam',
          width: 358,
          padding: 14,
          gap: 12,
          cornerRadius: 22,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          Row({ name: 'Top', width: 'fill_container', gap: 12 }, [
            part(
              'cover',
              F({ name: 'Cover', width: 54, height: 54, cornerRadius: 14, fill: img(ART.drift) }),
            ),
            Col({ gap: 2, width: 'fill_container' }, [
              part('title', T("Jonah's Jam", { fontSize: 14, fontWeight: '600' })),
              part(
                'meta',
                T('Luma Vale · Drift Control', { fontSize: 12, fill: C.mutedForeground }),
              ),
            ]),
            part(
              'action',
              Row(
                { name: 'Join', height: 34, padding: [0, 14], cornerRadius: 17, fill: C.primary },
                [
                  part(
                    'actionLabel',
                    T('Join', { fontSize: 13, fontWeight: '600', fill: C.primaryForeground }),
                  ),
                ],
              ),
            ),
          ]),
          part(
            'footer',
            Row({ name: 'Footer', width: 'fill_container', justifyContent: 'space_between' }, [
              Row(
                { name: 'Faces', gap: -8 },
                ['avatar2', 'avatar3', 'avatar4'].map((a) =>
                  F({
                    name: 'Face',
                    width: 28,
                    height: 28,
                    cornerRadius: 14,
                    stroke: C.card,
                    strokeWidth: 2,
                    fill: img(ART[a]),
                  }),
                ),
              ),
              Row({ gap: 6 }, [
                F({ name: 'Live', width: 7, height: 7, cornerRadius: 4, fill: C.success }),
                part(
                  'live',
                  T('Live · 3', { fontSize: 11, fontWeight: '600', fill: C.successText }),
                ),
              ]),
            ]),
          ),
        ],
      ),
    ),
    comp(
      'Player/Quality Badge',
      Row(
        {
          name: 'Quality',
          height: 30,
          padding: [0, 10],
          gap: 6,
          cornerRadius: 15,
          fill: C.secondary,
        },
        [
          part('dot', F({ name: 'Dot', width: 6, height: 6, cornerRadius: 3, fill: C.success })),
          part(
            'icon',
            I('monitor-speaker', { width: 13, height: 13, fill: C.foreground, enabled: false }),
          ),
          part(
            'text',
            T('FLAC 24/96 · 2304 kbps', {
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              fill: C.foreground,
            }),
          ),
        ],
      ),
    ),
  )
}
