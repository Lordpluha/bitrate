// Artist / Promotion post and translations: one plan step's post per channel — English master, UK and
// PL machine translations the artist reviews (edited translations are never overwritten), publishing
// by the artist, checks — as bento tiles, with every state.
import { postBlocks } from './promo-post.mjs'
import { pageSpec } from '../../../artist-ws/spec.mjs'

/** The promotion-post page spec. */
export function promotionPostPage(ui, frames) {
  const { Row, Btn, St, Alert, ErrorState } = ui
  const { grid, pageHead } = frames
  const b = postBlocks(ui, frames)
  const shell = {
    nav: 'music',
    crumb: 'Music / Afterglow / Promotion / Post',
    action: 'New release',
  }
  const page = (m, left, right) =>
    grid(m, [
      [8, left],
      [4, right],
    ])
  const stale = (desc) => [St('Warning', 'Stale', 'triangle-alert'), desc]
  return pageSpec(
    frames,
    {
      title: 'Artist / Promotion post and translations',
      route: 'planned — /dashboard/music/$releaseId?step=promotion (post panel)',
      context:
        'English master per channel; UK and PL are machine translations the artist reviews. Edited translations are never overwritten. Release workspace look, bento tiles on the 12-column grid.',
    },
    shell,
    (m) => [
      ...b.postHead(m),
      page(
        m,
        [b.master(m), b.translations(b.ukMachine(), b.plEdited()), b.ukEditor()],
        [b.publishing(), b.checks()],
      ),
    ],
    [
      [
        'Translating',
        shell,
        (m) => [
          ...b.postHead(m),
          page(
            m,
            [
              b.master(m),
              b.translations(
                [St('Processing', 'Translating', 'loader-circle'), 'Translating from English…'],
                [St('Neutral', 'Queued', 'clock'), 'Waiting for its turn'],
              ),
            ],
            [b.publishing()],
          ),
        ],
      ],
      [
        'English changed',
        shell,
        (m) => [
          ...b.postHead(m),
          Alert(
            'Warning',
            'English changed after these translations',
            'Review them. Your Polski edits are kept until you choose to update it.',
          ),
          page(
            m,
            [
              b.master(m),
              b.translations(
                stale('English changed · Update from English'),
                stale('Edited by you · English changed, review it'),
              ),
              Row({ name: 'Actions' }, [
                Btn('Update Українська', 'Secondary', 'refresh-cw'),
                Btn('Review Polski', 'Ghost'),
              ]),
            ],
            [b.publishing()],
          ),
        ],
      ],
      [
        'Copied',
        shell,
        (m) => [
          ...b.postHead(m),
          Alert(
            'Success',
            'Copied to the clipboard',
            'Paste it into Instagram, then mark the step as published.',
          ),
          page(m, [b.master(m)], [b.publishing()]),
        ],
      ],
      [
        'Published',
        shell,
        (m) => [
          ...b.postHead(m),
          page(
            m,
            [b.master(m), b.translations(b.ukMachine(), b.plEdited())],
            [b.publishing(St('Ready', 'Published', 'circle-check')), b.checks()],
          ),
        ],
      ],
      [
        'Channel draft failed',
        shell,
        (m) => [
          ...b.postHead(m, 1).filter((_, i) => i !== 1),
          ErrorState(
            'The TikTok script could not be written',
            'The other channels are ready. Try this one again.',
            'Try again',
            'triangle-alert',
            m,
          ),
        ],
      ],
      [
        'Post not found',
        shell,
        (m) => [
          pageHead('Promotion post', 'Afterglow · Promotion plan'),
          ErrorState(
            'This post no longer exists',
            'It was removed when the plan was regenerated.',
            'Back to the plan',
            'file-x',
            m,
          ),
        ],
      ],
    ],
  )
}
