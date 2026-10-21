// Library page blocks: music content.
import { C, T, H, I, F, Row, Col, Button, img, ART } from '../../kit.mjs'
import { part, comp, cover, slot, muted, iconBtn } from '../engine.mjs'

/** Registers this section's library components, in build order. */
export function register(add) {
  /* music content */
  add(
    comp(
      'Genre Tile',
      F(
        {
          name: 'Genre Tile',
          width: 192,
          height: 120,
          cornerRadius: 12,
          padding: 16,
          fill: C.purple600,
          clip: true,
        },
        [part('label', H('Genre', 20, { fontWeight: '700', fill: C.white }))],
      ),
    ),
    comp(
      'Episode Row',
      Row(
        {
          name: 'Episode Row',
          width: 'fill_container',
          padding: [16, 0],
          gap: 16,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          part('cover', cover({ width: 72, height: 72, fill: img(ART.stage) })),
          Col({ gap: 4, width: 'fill_container' }, [
            part('title', T('Episode title', { fontWeight: '600', fontSize: 15 })),
            part('meta', muted('Date · 48 min')),
          ]),
          I('bookmark', { width: 20, height: 20 }),
          F(
            {
              name: 'Play',
              width: 40,
              height: 40,
              cornerRadius: 20,
              fill: C.primary,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [I('play', { width: 18, height: 18, fill: C.primaryForeground })],
          ),
        ],
      ),
    ),
    comp(
      'Profile Header',
      Row(
        {
          name: 'Profile Header',
          width: 'fill_container',
          gap: 28,
          padding: [28, 0],
          alignItems: 'end',
        },
        [
          part(
            'avatar',
            cover({ width: 180, height: 180, cornerRadius: 9999, fill: img(ART.avatar2) }),
          ),
          Col({ gap: 8, width: 'fill_container' }, [
            part('label', T('Profile', { fontSize: 13, fontWeight: '600' })),
            part('name', H('Name', 72, { fontWeight: '700' })),
            part('sub', muted('Description')),
            slot('action', { layout: 'horizontal', width: 'fit_content' }),
          ]),
        ],
      ),
    ),
    comp(
      'Artist Hero',
      F(
        {
          name: 'Artist Hero',
          width: 'fill_container',
          height: 320,
          padding: 32,
          layout: 'vertical',
          justifyContent: 'end',
          gap: 8,
          cornerRadius: 16,
          fill: img(ART.luma),
        },
        [
          Row({ gap: 6 }, [
            I('badge-check', { width: 20, height: 20, fill: C.info }),
            T('Verified artist', { fontSize: 13, fontWeight: '600', fill: C.white }),
          ]),
          part('name', H('Artist', 80, { fontWeight: '700', fill: C.white })),
          part('listeners', T('1,284,503 monthly listeners', { fill: C.white })),
        ],
      ),
    ),
    comp(
      'Stat Tile',
      F(
        {
          name: 'Stat Tile',
          width: 'fill_container',
          layout: 'vertical',
          gap: 6,
          padding: 20,
          cornerRadius: 14,
          fill: C.card,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          part('label', muted('Label', { textGrowth: 'fixed-width', width: 'fill_container' })),
          part('value', H('0', 36, { fontWeight: '700' })),
          part('sub', muted('Sub', { textGrowth: 'fixed-width', width: 'fill_container' })),
        ],
      ),
    ),
    comp(
      'Notification Row/Unread',
      Row(
        {
          name: 'Notification',
          width: 'fill_container',
          padding: [14, 16],
          gap: 14,
          cornerRadius: 10,
          fill: C.muted,
        },
        [
          F(
            {
              width: 40,
              height: 40,
              cornerRadius: 20,
              fill: C.secondary,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [part('icon', I('bell', { width: 18, height: 18, fill: C.foreground }))],
          ),
          Col({ gap: 2, width: 'fill_container' }, [
            part(
              'text',
              T('Notification', {
                fontWeight: '600',
                textGrowth: 'fixed-width',
                width: 'fill_container',
              }),
            ),
            part('time', muted('now')),
          ]),
          F({ width: 8, height: 8, cornerRadius: 4, fill: C.primary }),
        ],
      ),
    ),
    comp(
      'Notification Row/Read',
      Row(
        {
          name: 'Notification',
          width: 'fill_container',
          padding: [14, 16],
          gap: 14,
          cornerRadius: 10,
        },
        [
          F(
            {
              width: 40,
              height: 40,
              cornerRadius: 20,
              fill: C.secondary,
              justifyContent: 'center',
              alignItems: 'center',
            },
            [part('icon', I('bell', { width: 18, height: 18, fill: C.foreground }))],
          ),
          Col({ gap: 2, width: 'fill_container' }, [
            part('text', T('Notification', { textGrowth: 'fixed-width', width: 'fill_container' })),
            part('time', muted('now')),
          ]),
        ],
      ),
    ),
    comp(
      'Activity Row',
      Row(
        {
          name: 'Activity Row',
          width: 'fill_container',
          padding: [14, 16],
          gap: 14,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          part(
            'avatar',
            cover({ width: 44, height: 44, cornerRadius: 9999, fill: img(ART.avatar3) }),
          ),
          Col({ gap: 2, width: 'fill_container' }, [
            Row({ gap: 4 }, [
              part('name', T('Name', { fontWeight: '600' })),
              part('action', T('liked', { fill: C.mutedForeground })),
            ]),
            part(
              'item',
              T('Track', { fontWeight: '600', textGrowth: 'fixed-width', width: 'fill_container' }),
            ),
            part('time', muted('now')),
          ]),
          part('cover', cover({ width: 52, height: 52, cornerRadius: 6 })),
          part('play', Button('Play', 'secondary', { icon: 'play' })),
        ],
      ),
    ),
    comp(
      'Chart Row',
      Row({ name: 'Chart Row', width: 'fill_container', height: 60, padding: [0, 12], gap: 16 }, [
        part('rank', H('1', 20, { fontWeight: '700', width: 32, textGrowth: 'fixed-width' })),
        part('trend', I('arrow-up', { width: 14, height: 14, fill: C.success })),
        part('cover', cover({ width: 44, height: 44, cornerRadius: 6 })),
        Col({ gap: 2, width: 'fill_container' }, [
          part('title', T('Title', { fontWeight: '600' })),
          part('artist', muted('Artist')),
        ]),
        part('plays', muted('0 plays')),
        part('duration', muted('0:00')),
      ]),
    ),
    comp(
      'Candidate Row',
      Row(
        {
          name: 'Candidate Row',
          width: 'fill_container',
          padding: [10, 14],
          gap: 14,
          cornerRadius: 10,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          I('grip-vertical', { width: 16, height: 16 }),
          part('rank', T('#1', { fontWeight: '700', width: 28, textGrowth: 'fixed-width' })),
          part('cover', cover({ width: 44, height: 44, cornerRadius: 6 })),
          Col({ gap: 2, width: 'fill_container' }, [
            part('title', T('Title', { fontWeight: '600' })),
            part('meta', muted('Artist · 0:00')),
          ]),
          iconBtn('play'),
          iconBtn('thumbs-up'),
          iconBtn('x'),
        ],
      ),
    ),
    comp(
      'Candidate Row/Compact',
      Row(
        {
          name: 'Candidate Row',
          width: 'fill_container',
          padding: [10, 12],
          gap: 10,
          cornerRadius: 10,
          stroke: C.border,
          strokeWidth: 1,
        },
        [
          part('rank', T('#1', { fontWeight: '700', width: 24, textGrowth: 'fixed-width' })),
          part('cover', cover({ width: 40, height: 40, cornerRadius: 6 })),
          Col({ gap: 2, width: 'fill_container' }, [
            part(
              'title',
              T('Title', { fontWeight: '600', textGrowth: 'fixed-width', width: 'fill_container' }),
            ),
            part('meta', muted('Artist', { textGrowth: 'fixed-width', width: 'fill_container' })),
          ]),
          iconBtn('thumbs-up'),
          iconBtn('x'),
        ],
      ),
    ),
    comp(
      'Artist Hero/Mobile',
      F(
        {
          name: 'Artist Hero',
          width: 358,
          height: 260,
          padding: 16,
          layout: 'vertical',
          justifyContent: 'end',
          gap: 4,
          cornerRadius: 14,
          fill: img(ART.luma),
        },
        [
          Row({ gap: 6 }, [
            I('badge-check', { width: 16, height: 16, fill: C.info }),
            T('Verified artist', { fontSize: 12, fontWeight: '600', fill: C.white }),
          ]),
          part(
            'name',
            H('Artist', 40, {
              fontWeight: '700',
              fill: C.white,
              lineHeight: 1.05,
              textGrowth: 'fixed-width',
              width: 'fill_container',
            }),
          ),
          part('listeners', T('1,284,503 monthly listeners', { fontSize: 13, fill: C.white })),
        ],
      ),
    ),
    comp(
      'Stepper/Step Done',
      Row({ name: 'Step', gap: 8 }, [
        F(
          {
            width: 26,
            height: 26,
            cornerRadius: 13,
            justifyContent: 'center',
            alignItems: 'center',
            fill: C.primary,
          },
          [I('check', { width: 14, height: 14, fill: C.primaryForeground })],
        ),
        part('label', T('Step', { fontSize: 13 })),
      ]),
    ),
    comp(
      'Stepper/Step Current',
      Row({ name: 'Step', gap: 8 }, [
        F(
          {
            width: 26,
            height: 26,
            cornerRadius: 13,
            justifyContent: 'center',
            alignItems: 'center',
            fill: C.primary,
          },
          [part('number', T('2', { fontSize: 12, fontWeight: '700', fill: C.primaryForeground }))],
        ),
        part('label', T('Step', { fontSize: 13, fontWeight: '600' })),
      ]),
    ),
    comp(
      'Stepper/Step Upcoming',
      Row({ name: 'Step', gap: 8 }, [
        F(
          {
            width: 26,
            height: 26,
            cornerRadius: 13,
            justifyContent: 'center',
            alignItems: 'center',
            fill: C.muted,
          },
          [part('number', T('3', { fontSize: 12, fontWeight: '700', fill: C.mutedForeground }))],
        ),
        part('label', T('Step', { fontSize: 13, fill: C.mutedForeground })),
      ]),
    ),
    comp(
      'Stepper/Connector',
      F({ name: 'Connector', width: 'fill_container', height: 1, fill: C.border }),
    ),
    comp(
      'Stepper/Connector Done',
      F({ name: 'Connector', width: 'fill_container', height: 1, fill: C.primary }),
    ),
    comp(
      'Equalizer',
      Row(
        {
          name: 'Equalizer',
          width: 'fill_container',
          height: 160,
          gap: 8,
          justifyContent: 'space_between',
          padding: [12, 16],
          cornerRadius: 12,
          fill: C.muted,
          alignItems: 'end',
        },
        [
          Col({ gap: 46, height: 'fill_container' }, [
            muted('+12dB'),
            muted('0dB'),
            muted('-12dB'),
          ]),
          ...[
            ['60Hz', 70],
            ['150Hz', 96],
            ['400Hz', 58],
            ['1KHz', 82],
            ['2.4KHz', 64],
            ['15KHz', 90],
          ].map(([b, h]) =>
            Col({ name: `Band ${b}`, gap: 8, alignItems: 'center' }, [
              F({ width: 10, height: h, cornerRadius: 5, fill: C.primary }),
              muted(b),
            ]),
          ),
        ],
      ),
    ),
    comp(
      'Graph Node',
      Col({ name: 'Graph Node', gap: 8, alignItems: 'center', width: 140 }, [
        part('avatar', cover({ width: 84, height: 84, cornerRadius: 9999, fill: img(ART.night) })),
        part('label', T('Artist', { fontWeight: '600', fontSize: 13 })),
        part('sub', muted('Similar')),
      ]),
    ),
    comp(
      'Graph Node/Focus',
      Col({ name: 'Graph Node', gap: 8, alignItems: 'center', width: 140 }, [
        part(
          'avatar',
          cover({
            width: 112,
            height: 112,
            cornerRadius: 9999,
            fill: img(ART.luma),
            stroke: C.primary,
            strokeWidth: 3,
          }),
        ),
        part('label', T('Artist', { fontWeight: '600', fontSize: 15 })),
        part('sub', muted('You are here')),
      ]),
    ),
    comp(
      'Bar Chart/Bar',
      Col({ name: 'Bar', gap: 8, alignItems: 'center', width: 'fill_container' }, [
        part('bar', F({ width: 'fill_container', height: 100, cornerRadius: 6, fill: C.muted })),
        part('label', muted('Mon')),
      ]),
    ),
    comp(
      'Bar Chart/Bar Highlight',
      Col({ name: 'Bar', gap: 8, alignItems: 'center', width: 'fill_container' }, [
        part('bar', F({ width: 'fill_container', height: 140, cornerRadius: 6, fill: C.primary })),
        part('label', muted('Fri')),
      ]),
    ),
  )
}
