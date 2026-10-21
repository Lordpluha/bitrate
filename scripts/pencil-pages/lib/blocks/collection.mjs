// Library page blocks: collection header, action bars, section and table headers.
import { C, T, H, I, F, Row, Col } from '../../kit.mjs'
import { part, comp, cover, gradient, muted } from '../engine.mjs'

/* collection header + action bars + section header + table header */
const collectionHeader = (name, coverNode) =>
  comp(
    name,
    F(
      {
        name: 'Collection Header',
        width: 'fill_container',
        height: 260,
        padding: 28,
        gap: 24,
        alignItems: 'end',
        cornerRadius: 16,
        fill: gradient(C.heroWash, C.card, 180),
      },
      [
        coverNode,
        Col({ name: 'Copy', gap: 10, width: 'fill_container' }, [
          part('type', T('Playlist', { fontSize: 13, fontWeight: '600' })),
          part('title', H('Title', 64, { fontWeight: '700' })),
          Row({ gap: 8 }, [
            part('owner', T('Owner', { fontWeight: '600' })),
            part('meta', muted('· 24 songs')),
          ]),
        ]),
      ],
    ),
    { cell: 'wide' },
  )
/** Registers this section's library components, in build order. */
export function register(add) {
  add(
    collectionHeader(
      'Collection Header',
      part('cover', cover({ width: 200, height: 200, cornerRadius: 12 })),
    ),
    collectionHeader(
      'Collection Header/Liked',
      F(
        {
          name: 'Liked',
          width: 200,
          height: 200,
          cornerRadius: 12,
          fill: gradient(C.gradientPrimaryFrom, C.gradientPrimaryTo),
          justifyContent: 'center',
          alignItems: 'center',
        },
        [I('heart', { width: 64, height: 64, fill: C.white })],
      ),
    ),
    comp(
      'Action Bar',
      Row({ name: 'Action Bar', gap: 18 }, [
        F(
          {
            name: 'Play',
            width: 56,
            height: 56,
            cornerRadius: 28,
            fill: C.primary,
            justifyContent: 'center',
            alignItems: 'center',
          },
          [I('play', { width: 24, height: 24, fill: C.primaryForeground })],
        ),
        part('shuffle', I('shuffle', { width: 26, height: 26 })),
        part('download', I('circle-arrow-down', { width: 26, height: 26 })),
        part('like', I('heart', { width: 26, height: 26 })),
        part('invite', I('user-plus', { width: 26, height: 26 })),
        part('more', I('ellipsis', { width: 26, height: 26 })),
      ]),
    ),
    comp(
      'Section Header',
      Row({ name: 'Section Header', width: 'fill_container', justifyContent: 'space_between' }, [
        part('title', H('Section', 22)),
        part('action', T('Show all', { fontSize: 13, fontWeight: '600', fill: C.mutedForeground })),
      ]),
      { cell: 'wide' },
    ),
    comp(
      'Track Table/Header',
      Row(
        {
          name: 'Track Table Header',
          width: 'fill_container',
          height: 36,
          padding: [0, 0],
          gap: 0,
          stroke: C.border,
          strokeWidth: { bottom: 1 },
        },
        [
          /* same columns as Track Row/Default: 42 number cell, fluid title, 260 album, 130 added, 90 actions */
          T('#', {
            fontSize: 12,
            fill: C.mutedForeground,
            width: 42,
            textGrowth: 'fixed-width',
            textAlign: 'center',
          }),
          T('Title', {
            fontSize: 12,
            fill: C.mutedForeground,
            width: 'fill_container',
            textGrowth: 'fixed-width',
          }),
          part(
            'album',
            T('Album', {
              fontSize: 12,
              fill: C.mutedForeground,
              width: 260,
              textGrowth: 'fixed-width',
            }),
          ),
          part(
            'added',
            T('Date added', {
              fontSize: 12,
              fill: C.mutedForeground,
              width: 130,
              textGrowth: 'fixed-width',
            }),
          ),
          F({ name: 'Duration Column', width: 90, justifyContent: 'end' }, [
            I('clock-3', { width: 16, height: 16 }),
          ]),
        ],
      ),
      { cell: 'wide' },
    ),
    comp(
      'Track Row/Playing',
      Row(
        {
          name: 'Track Row',
          width: 'fill_container',
          height: 68,
          /* same columns as Track Row/Default so the playing row lines up with the rest */
          padding: [6, 0],
          cornerRadius: 8,
          fill: C.muted,
        },
        [
          F(
            {
              name: 'Number Cell',
              width: 42,
              height: 'fill_container',
              justifyContent: 'center',
              alignItems: 'center',
            },
            [I('audio-lines', { width: 16, height: 16, fill: C.primary })],
          ),
          Row({ name: 'Title Cell', gap: 12, width: 'fill_container' }, [
            part('cover', cover({ width: 46, height: 46, cornerRadius: 6 })),
            Col({ gap: 2 }, [
              part('title', T('Afterglow', { fontWeight: '600', fill: C.primary })),
              part('artist', muted('Nova & the Static')),
            ]),
          ]),
          part('album', muted('Afterglow', { width: 260, textGrowth: 'fixed-width' })),
          part(
            'added',
            T('Today', {
              fontSize: 12,
              fill: C.textSubdued,
              width: 130,
              textGrowth: 'fixed-width',
            }),
          ),
          Row({ name: 'Actions', width: 90, gap: 14, justifyContent: 'end' }, [
            I('heart', { width: 16, height: 16, fill: C.primary }),
            part('duration', muted('3:42')),
          ]),
        ],
      ),
      { cell: 'wide' },
    ),
  )
}
