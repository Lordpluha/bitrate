// Release promotion states before a plan exists: no promotion profile, no release date, ready to
// generate, generating and a failed generation.

/** States of the release promotion page without a plan. */
export function releasePromotionStatesBefore(ui, frames, kit) {
  const { Row, Tx, P, Btn, St, Tile, Empty, ErrorState } = ui
  const { releaseHead, grid } = frames
  const { shell, next, head, pending, draftSteps } = kit
  const { profileCard, usage } = kit
  return [
    [
      'No promotion profile',
      shell,
      (m) => [
        ...head(
          m,
          next(
            'Set up your promotion profile',
            'A plan needs your goal, channels and voice.',
            'Set up profile',
          ),
        ),
        Empty(
          'Set up your promotion profile',
          'Tell Bitrate your goal, channels and voice once. Every release plan uses it.',
          'Set up profile',
          'megaphone',
          m,
        ),
      ],
    ],
    [
      'No release date',
      shell,
      (m) => [
        ...releaseHead(
          m,
          {
            meta: { content: 'Demo artist · Single · No release date' },
            status: St('Neutral', 'Draft', 'file-pen'),
            ...next(
              'Pick a release date',
              'Promotion is planned around it.',
              'Choose release date',
              'calendar',
            ),
          },
          draftSteps,
        ),
        Empty(
          'Pick a release date first',
          'A plan is built around the release date: four weeks before it and four weeks after.',
          'Choose release date',
          'calendar',
          m,
        ),
      ],
    ],
    [
      'Ready to generate',
      shell,
      (m) => [
        ...head(
          m,
          next(
            'Generate a promotion plan',
            'About a minute. You approve every step.',
            'Generate plan',
            'sparkles',
          ),
        ),
        grid(m, [
          [
            8,
            [
              Tile(
                'Promotion plan',
                'sparkles',
                [
                  Tx('H2', 'Plan the eight weeks around Afterglow'),
                  P(
                    'Muted',
                    'AI suggests dated steps and post drafts from your release details and profile. You approve each one.',
                  ),
                  Row({ name: 'Action' }, [Btn('Generate promotion plan', 'Primary', 'sparkles')]),
                  Tx('Caption', 'Uses about $0.10 of your monthly AI allowance.'),
                ],
                { hue: true },
              ),
            ],
          ],
          [4, [profileCard(), usage()]],
        ]),
      ],
    ],
    [
      'Generating',
      shell,
      (m) => [
        ...head(
          m,
          next('Your plan is being generated', 'Up to a minute. You can leave this page.', null),
        ),
        Row({ name: 'Progress' }, [
          St('Processing', 'Generating plan', 'loader-circle'),
          Tx('Caption', 'Up to a minute. You can leave this page.'),
        ]),
        grid(m, [
          [8, [pending(1), pending(2)]],
          [4, [pending(3)]],
        ]),
      ],
    ],
    [
      'Generation failed',
      shell,
      (m) => [
        ...head(
          m,
          next(
            'Try generating the plan again',
            'Nothing was taken from your allowance.',
            'Try again',
            'refresh-cw',
          ),
        ),
        ErrorState(
          'The plan could not be generated',
          'Your profile and earlier versions are kept, and nothing was taken from your allowance.',
          'Try again',
          'triangle-alert',
          m,
        ),
      ],
    ],
  ]
}
