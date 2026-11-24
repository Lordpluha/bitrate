// Release promotion states with a plan: allowance used, regenerating a step, the follower message and
// a moved release date.

/** States of the release promotion page with a plan. */
export function releasePromotionStatesAfter(ui, frames, kit) {
  const { Row, Tx, Btn, AI, Tile, Field, Check, Alert } = ui
  const { grid } = frames
  const { shell, next, head, plan } = kit
  const { phases, summary, usage } = kit
  return [
    [
      'Allowance used',
      shell,
      (m) => [
        ...head(
          m,
          next(
            'Approved steps stay available',
            'New AI drafts wait until your allowance resets on Oct 1.',
            null,
          ),
        ),
        Alert(
          'Warning',
          'Monthly AI allowance used',
          'You have used $2.00 of $2.00. It resets on Oct 1. Your approved steps and posts stay available.',
        ),
        plan(
          m,
          [
            summary(
              Btn('Regenerate unavailable', 'Secondary', 'lock', { width: 'fill_container' }),
            ),
            usage('$2.00', 'fill_container'),
          ],
          { suggested: false },
        ),
      ],
    ],
    [
      'Regenerate a step',
      shell,
      (m) => [
        ...head(m),
        grid(m, [
          [
            8,
            [
              Tile(
                'Regenerate this step',
                'refresh-cw',
                [
                  Tx('Body Strong', 'T−7 · Sep 19 — Share a 15-second hook from Afterglow'),
                  Field('What should change? (optional)', 'Shorter, no emoji'),
                  Row({ name: 'Actions' }, [
                    Btn('Regenerate', 'Primary', 'refresh-cw'),
                    Btn('Cancel', 'Ghost'),
                  ]),
                  Tx('Caption', 'The current version stays in the plan history.'),
                ],
                { hue: true },
              ),
              ...phases(m).slice(1),
            ],
          ],
          [4, [summary(), usage()]],
        ]),
      ],
    ],
    [
      'Follower message',
      { ...shell, crumb: 'Music / Afterglow / Promotion / Follower message' },
      (m) => [
        ...head(m),
        grid(m, [
          [
            8,
            [
              Tile(
                'Message to your followers',
                'message-circle-heart',
                [
                  Field(
                    'Message',
                    'Afterglow is out. Thank you for waiting with me. This one is for the late nights.',
                    'Textarea',
                  ),
                  Tx(
                    'Caption',
                    '84 / 280 characters · Sent once, with the new-release notification',
                  ),
                  Check(false, 'Approve before Sep 26, 18:00 UTC to include it'),
                  /* on a phone approval takes its own line above the secondary actions */
                  ...(m
                    ? [
                        Btn('Approve message', 'Primary', 'check', { width: 'fill_container' }),
                        Row({ name: 'Actions' }, [
                          Btn('Regenerate', 'Ghost', 'refresh-cw'),
                          Btn('Reject', 'Ghost', 'x'),
                        ]),
                      ]
                    : [
                        Row({ name: 'Actions' }, [
                          Btn('Approve message', 'Primary', 'check'),
                          Btn('Regenerate', 'Ghost', 'refresh-cw'),
                          Btn('Reject', 'Ghost', 'x'),
                        ]),
                      ]),
                  Tx('Caption', 'Without approval, followers get the standard notification only.'),
                ],
                { right: [AI()] },
              ),
            ],
          ],
          [4, [summary()]],
        ]),
      ],
    ],
    [
      'Release date moved',
      shell,
      (m) => [
        ...head(m),
        Alert(
          'Warning',
          'Release date moved to Oct 3',
          'Every step moved by 7 days. Check posts that mention a date.',
        ),
        plan(m, [summary(), usage()]),
      ],
    ],
  ]
}
