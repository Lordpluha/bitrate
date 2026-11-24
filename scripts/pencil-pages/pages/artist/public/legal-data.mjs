// Excerpts of apps/web-artists/src/shared/legal/documents.ts for the legal page design, with the inline
// markup (**bold**, [label](slug)) flattened to plain text. Blocks: [kind, …] with kind p | note | list |
// table, as in LegalBlock.

export const LEGAL_TITLES = [
  'Terms of Use',
  'Privacy Policy',
  'Community Guidelines',
  'Complaints and reports',
  'Copyright and notice-and-action',
  'Artist Agreement',
]

export const TERMS = {
  title: 'Terms of Use',
  sections: [
    [
      null,
      [
        ['p', 'Effective date: 1 October 2026'],
        [
          'p',
          'These Terms of Use ("Terms") govern your use of Bitrate, a music streaming and publishing service operated by Vladyslav Tesliuk, Warsaw, Poland, a private individual ("Bitrate", "we", "us"). Contact: tesluakevlad@gmail.com.',
        ],
      ],
    ],
    [
      '1. Acceptance and eligibility',
      [
        [
          'p',
          '1.1 By creating an account or using Bitrate you agree to these Terms and the Community Guidelines, and you confirm that you have read the Privacy Policy.',
        ],
        [
          'p',
          '1.2 You must be at least 16 years old. If you are younger you may not create an account or use the service.',
        ],
        [
          'p',
          '1.3 If you use Bitrate on behalf of an organisation, you confirm you may bind it to these Terms.',
        ],
      ],
    ],
    [
      '2. Your account',
      [
        [
          'p',
          '2.1 Provide accurate information and keep your credentials secure. You are responsible for activity on your account.',
        ],
        ['p', '2.2 Tell us promptly at tesluakevlad@gmail.com if you suspect unauthorised access.'],
        [
          'p',
          '2.3 We may limit or lock an account after repeated failed sign-in attempts to protect it.',
        ],
      ],
    ],
    [
      '3. The service',
      [
        [
          'p',
          '3.1 Listeners may stream music, build playlists, follow artists and use related features.',
        ],
        [
          'p',
          '3.2 Artists may upload and publish their own recordings under the Artist Agreement.',
        ],
      ],
    ],
  ],
}

export const PRIVACY = {
  title: 'Privacy Policy',
  sections: [
    [
      '3. What we collect, why, and on what legal basis',
      [
        [
          'table',
          ['Data', 'Purpose', 'Legal basis (GDPR Art. 6)'],
          [
            [
              'Email, username, password hash, avatar, profile description, interface language',
              'Create and run your account, send service emails (verification, password reset)',
              'Contract (6(1)(b))',
            ],
            [
              'Two-factor secret (if you enable 2FA), sessions and device records',
              'Secure sign-in, keep you signed in, show your devices',
              'Contract; legitimate interest in security (6(1)(f))',
            ],
            [
              'Sign-in identity from Google or Facebook (provider account id, email, name)',
              'Sign in with a social account (see section 4)',
              'Contract',
            ],
            [
              'Playlists, likes, follows, notifications',
              'Provide the features you use',
              'Contract',
            ],
          ],
        ],
      ],
    ],
  ],
}

export const COMMUNITY = {
  title: 'Community Guidelines',
  sections: [
    [
      null,
      [
        ['p', 'Effective date: 1 October 2026'],
        [
          'p',
          'Bitrate is a place for music and the people who make and enjoy it. These guidelines explain what is and is not allowed. They form part of the Terms of Use.',
        ],
      ],
    ],
    [
      'What we expect',
      [
        [
          'list',
          [
            'Upload only music and audio you have the right to share.',
            'Be honest about who you are and what you publish: no impersonation, no misleading titles or artwork.',
            'Mark explicit content correctly.',
            'Treat other people with respect.',
          ],
        ],
      ],
    ],
  ],
}

export const COMPLAINTS = {
  title: 'Complaints and reports',
  sections: [
    [
      'Notes',
      [
        [
          'note',
          'A web form and an in-app report option for tracks, albums and accounts are planned; today the in-app option covers playlists only.',
        ],
      ],
    ],
  ],
}
