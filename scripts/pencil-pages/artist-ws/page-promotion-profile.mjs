// Artist / Promotion profile: set once per artist and overridable per release; states what is sent to
// the AI provider and what is not. Form tiles on eight columns, the privacy tile on four.
import { profileBlocks } from './promo-profile.mjs'
import { pageSpec } from './spec.mjs'

/** The promotion-profile page spec. */
export function promotionProfilePage(ui, frames) {
  const { W, St, Alert } = ui
  const { grid, pageHead } = frames
  const { form, privacy, saving } = profileBlocks(ui)
  const shell = {
    nav: 'promotion',
    crumb: 'Promotion / Profile',
    action: 'Save profile',
    actionIcon: 'check',
  }
  const busy = { ...shell, action: null }
  const intro = 'Used for every promotion plan. You can change it for one release.'
  const page = (m, o, side = [privacy()]) =>
    grid(m, [
      [8, form(m, o)],
      [4, side],
    ])
  const skeleton = (n) => W('Skeleton/Tile', { name: `Loading ${n}`, width: 'fill_container' })
  return pageSpec(
    frames,
    {
      title: 'Artist / Promotion profile',
      route: 'planned — /dashboard/promotion/profile',
      context:
        'Set once per artist and overridable per release. States what is sent to the AI provider and what is not.',
    },
    shell,
    (m) => [pageHead('Promotion profile', intro), page(m)],
    [
      [
        'First visit',
        shell,
        (m) => [
          pageHead(
            'Set up your promotion profile',
            'Five short answers. You can change them later.',
            [St('Neutral', 'Not set up', 'circle-dashed')],
          ),
          page(m, { filled: false }),
        ],
      ],
      [
        'Loading',
        busy,
        (m) => [
          pageHead('Promotion profile', 'Loading your profile…'),
          grid(m, [
            [8, [skeleton(1), skeleton(2)]],
            [4, [skeleton(3)]],
          ]),
        ],
      ],
      [
        'Needs changes',
        shell,
        (m) => [
          pageHead('Promotion profile', 'Two fields need changes before saving.'),
          page(m, { errors: true }),
        ],
      ],
      [
        'Saving',
        busy,
        (m) => [
          pageHead('Promotion profile', intro, [St('Processing', 'Saving', 'loader-circle')]),
          page(m, {}, [privacy(saving())]),
        ],
      ],
      [
        'Save failed',
        shell,
        (m) => [
          pageHead('Promotion profile', intro),
          Alert('Error', 'Profile not saved', 'Your changes are still here. Try again.'),
          page(m),
        ],
      ],
    ],
  )
}
