// Profile and analytics pieces: the public profile preview card (views/ProfileView ProfileCard: header
// image, photo, name with the verified mark, handle, country, bio and links), the image fields of the
// profile form (square photo, wide header), a link field with its service icon and the hued stat tile
// of the analytics highlights (StatTile).
import { C, Col, F, I, Row, T } from '../kit.mjs'
import { COVER_ART } from './lib-media.mjs'
import { artistPaint } from './paint.mjs'

const AVATARS = '../../web-player-design/design-system/assets/avatars/'

/** Adds the profile card, image and link fields and the hued stat to the library. */
export function addProfile(lib) {
  const { comp, part, add, slot } = lib
  const paint = artistPaint()
  const wrap = { width: 'fill_container', textGrowth: 'fixed-width', lineHeight: 1.5 }
  const small = (s, o = {}) => T(s, { fontSize: 11, fill: C.artistTextSecondary, ...wrap, ...o })
  const image = (name, url, w, h, r) =>
    part(
      name,
      F({
        name,
        width: w,
        height: h,
        cornerRadius: r,
        fill: { type: 'image', url, mode: 'cover' },
        stroke: C.artistReleaseBorder,
        strokeWidth: 1,
      }),
    )
  add(
    comp(
      'Profile/Card',
      Col(
        {
          name: 'Profile Card',
          width: 520,
          gap: 0,
          cornerRadius: 16,
          clip: true,
          ...paint.releaseGlass(),
        },
        [
          image('header', `${COVER_ART}album-afterglow.webp`, 'fill_container', 140, 0),
          Col({ name: 'Identity', gap: 10, width: 'fill_container', padding: [16, 20, 20, 20] }, [
            part('note', small('Preview · unsaved changes are shown but not published')),
            image('photo', `${AVATARS}avatar1.jpg`, 88, 88, 44),
            Row({ name: 'Name', gap: 8 }, [
              part(
                'name',
                T('Mira Sol', { fontSize: 22, fontWeight: '500', fill: C.artistForeground }),
              ),
              part('verified', I('badge-check', { width: 18, height: 18, fill: C.artistIcon })),
            ]),
            part('handle', small('@mirasol')),
            Row({ name: 'Country', gap: 6 }, [
              I('map-pin', { width: 13, height: 13, fill: C.artistTextSecondary }),
              part('country', small('Poland', { width: 'fit_content', textGrowth: 'auto' })),
            ]),
            part('bio', T('No bio yet.', { fontSize: 12, fill: C.artistForeground, ...wrap })),
            slot('links', { layout: 'horizontal', width: 'fit_content', gap: 6 }),
          ]),
          /* the photo and header image fields live in the card (.artist-profile-images) */
          slot('images', { layout: 'horizontal', gap: 20, padding: [0, 20, 20, 20] }),
        ],
      ),
    ),
  )
  for (const wide of [false, true])
    add(
      comp(
        `Field/Image${wide ? ' Wide' : ''}`,
        Row({ name: 'Image Field', width: 520, gap: 14, alignItems: 'start' }, [
          image(
            'preview',
            wide ? `${COVER_ART}album-afterglow.webp` : `${AVATARS}avatar1.jpg`,
            wide ? 160 : 72,
            wide ? 64 : 72,
            wide ? 10 : 36,
          ),
          Col({ name: 'Text', gap: 4, width: 'fill_container' }, [
            part(
              'label',
              T(wide ? 'Header image' : 'Profile photo', {
                fontSize: 12,
                fontWeight: '500',
                fill: C.artistForeground,
              }),
            ),
            part(
              'hint',
              small(
                wide
                  ? 'Wide, at least 2000 × 800 px. JPEG, PNG or WebP up to 10 MB.'
                  : 'Square, at least 600 × 600 px. JPEG, PNG or WebP up to 10 MB.',
              ),
            ),
            slot('action', { layout: 'horizontal', width: 'fit_content', gap: 8 }),
          ]),
        ]),
      ),
    )
  add(
    comp(
      'Field/Link',
      Row({ name: 'Link Field', width: 520, gap: 10 }, [
        Row({ name: 'Service', width: 120, gap: 8 }, [
          part('icon', I('globe', { width: 15, height: 15, fill: C.artistIcon })),
          part(
            'label',
            small('Website', {
              width: 'fit_content',
              textGrowth: 'auto',
              fill: C.artistForeground,
            }),
          ),
        ]),
        Row(
          {
            name: 'Box',
            width: 'fill_container',
            height: 40,
            padding: [0, 12],
            cornerRadius: 10,
            ...paint.control(),
          },
          [
            part(
              'value',
              T('https://', {
                fontSize: 12,
                fill: C.artistTextSecondary,
                width: 'fill_container',
                textGrowth: 'fixed-width',
              }),
            ),
          ],
        ),
      ]),
    ),
  )
  add(
    comp(
      'Stat/Hue',
      Row(
        {
          name: 'Hued Stat',
          width: 320,
          gap: 12,
          padding: 14,
          cornerRadius: 12,
          alignItems: 'start',
          ...paint.control(),
        },
        [
          Row(
            {
              name: 'Icon',
              width: 36,
              height: 36,
              cornerRadius: 18,
              justifyContent: 'center',
              fill: paint.tint(C.chart1, 0.16),
            },
            [part('icon', I('users', { width: 17, height: 17, fill: C.chart1 }))],
          ),
          Col({ name: 'Text', gap: 2, width: 'fill_container' }, [
            part('label', small('Listeners')),
            part(
              'value',
              T('4,390', { fontSize: 24, fontWeight: '500', fill: C.artistForeground }),
            ),
            part('caption', small('22% vs previous period')),
          ]),
        ],
      ),
    ),
  )
}
