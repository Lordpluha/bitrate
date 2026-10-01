/**
 * Draft legal texts, converted from `apps/docs/docs/legal/`. Placeholders such as
 * [[OPERATOR_NAME]] are deliberately left in: the texts are drafts pending legal review and
 * the operator details do not exist yet. Inline markup is limited to **bold** and
 * `[label](slug)` links to a sibling document.
 */

export const LEGAL_SLUGS = [
  'terms',
  'privacy',
  'community',
  'complaints',
  'copyright',
] as const

/** The slug of one legal document; also its URL segment. */
export type LegalSlug = (typeof LEGAL_SLUGS)[number]

/** A table whose cells use the same inline markup as paragraphs. */
export type LegalTable = { header: string[]; rows: string[][] }

/** One block of a section. */
export type LegalBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'note'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | ({ kind: 'table' } & LegalTable)

/** A headed run of blocks; the lead-in before the first heading has no heading. */
export type LegalSection = { heading: string | null; blocks: LegalBlock[] }

/** One legal document. */
export type LegalDocument = {
  slug: LegalSlug
  title: string
  sections: LegalSection[]
}

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  {
    slug: 'terms',
    title: 'Terms of Use',
    sections: [
      {
        heading: null,
        blocks: [
          {
            kind: 'paragraph',
            text: '**Effective date:** [[EFFECTIVE_DATE]]',
          },
          {
            kind: 'paragraph',
            text: 'These Terms of Use ("Terms") govern your use of Bitrate, a music streaming and publishing service operated by [[OPERATOR_NAME]], [[OPERATOR_ADDRESS]], registration number [[OPERATOR_REGISTRATION]] ("Bitrate", "we", "us"). Contact: [[LEGAL_CONTACT_EMAIL]].',
          },
        ],
      },
      {
        heading: '1. Acceptance and eligibility',
        blocks: [
          {
            kind: 'paragraph',
            text: '1.1 By creating an account or using Bitrate you agree to these Terms and the [Community Guidelines](community), and you confirm that you have read the [Privacy Policy](privacy).',
          },
          {
            kind: 'paragraph',
            text: '1.2 You must be **at least 16 years old**. If you are younger you may not create an account or use the service.',
          },
          {
            kind: 'paragraph',
            text: '1.3 If you use Bitrate on behalf of an organisation, you confirm you may bind it to these Terms.',
          },
        ],
      },
      {
        heading: '2. Your account',
        blocks: [
          {
            kind: 'paragraph',
            text: '2.1 Provide accurate information and keep your credentials secure. You are responsible for activity on your account.',
          },
          {
            kind: 'paragraph',
            text: '2.2 Tell us promptly at [[LEGAL_CONTACT_EMAIL]] if you suspect unauthorised access.',
          },
          {
            kind: 'paragraph',
            text: '2.3 We may limit or lock an account after repeated failed sign-in attempts to protect it.',
          },
        ],
      },
      {
        heading: '3. The service',
        blocks: [
          {
            kind: 'paragraph',
            text: '3.1 Listeners may stream music and podcasts, build playlists, follow artists and use related features.',
          },
          {
            kind: 'paragraph',
            text: '3.2 Artists may upload and publish their own recordings under the [Artist Agreement](artist-agreement).',
          },
          {
            kind: 'paragraph',
            text: '3.3 We may change, suspend or discontinue features. Where a change materially affects you we will give reasonable notice.',
          },
        ],
      },
      {
        heading: '4. Acceptable use',
        blocks: [
          {
            kind: 'paragraph',
            text: 'You must follow the [Community Guidelines](community). In particular you must not:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              "infringe another person's copyright or other rights;",
              'attempt to bypass access controls, scrape the service at scale, or interfere with its operation;',
              'use the service to harass others or to distribute unlawful content;',
              'use automated means to inflate plays, likes or follows.',
            ],
          },
        ],
      },
      {
        heading: '5. Content and licences',
        blocks: [
          {
            kind: 'paragraph',
            text: '5.1 You keep ownership of content you upload ("Your Content").',
          },
          {
            kind: 'paragraph',
            text: '5.2 You grant Bitrate a non-exclusive, worldwide, royalty-free licence to host, store, transcode, reproduce and stream Your Content solely to operate the service for you and its users. This licence ends when you remove Your Content, subject to reasonable backup and legal-retention periods.',
          },
          {
            kind: 'paragraph',
            text: '5.3 You confirm that you hold, or have licensed, all rights needed to upload Your Content and to grant the licence in 5.2. Bitrate is a hosting service, not a record label, and takes no ownership of your recordings.',
          },
        ],
      },
      {
        heading: '6. Copyright complaints',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Report suspected infringement through the process in [Copyright and notice-and-action](copyright). We apply a repeat-infringer policy: accounts that repeatedly upload infringing content may be terminated.',
          },
        ],
      },
      {
        heading: '7. Suspension and termination',
        blocks: [
          {
            kind: 'paragraph',
            text: '7.1 You may stop using Bitrate and delete your account at any time [[ACCOUNT_DELETION_NOTE]].',
          },
          {
            kind: 'paragraph',
            text: '7.2 We may suspend or terminate an account that breaches these Terms or the law. Where required we will state the reasons and describe how to contest the decision.',
          },
        ],
      },
      {
        heading: '8. Disclaimers and liability',
        blocks: [
          {
            kind: 'paragraph',
            text: '8.1 The service is provided "as is" to the extent permitted by law. Mandatory consumer rights under EU and Polish law are not affected.',
          },
          {
            kind: 'paragraph',
            text: '8.2 [[LIABILITY_CLAUSE — counsel to draft limits that are valid under EU consumer law]]',
          },
        ],
      },
      {
        heading: '9. Changes to these Terms',
        blocks: [
          {
            kind: 'paragraph',
            text: 'We may update these Terms. We will tell you about material changes before they take effect. Continuing to use Bitrate after the effective date means you accept the new version.',
          },
        ],
      },
      {
        heading: '10. Governing law and disputes',
        blocks: [
          {
            kind: 'paragraph',
            text: 'These Terms are governed by [[GOVERNING_LAW]]. Mandatory consumer-protection rules of your country of residence continue to apply.',
          },
        ],
      },
      {
        heading: '11. Contact',
        blocks: [
          {
            kind: 'paragraph',
            text: '[[OPERATOR_NAME]], [[OPERATOR_ADDRESS]] — [[LEGAL_CONTACT_EMAIL]].',
          },
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    sections: [
      {
        heading: null,
        blocks: [
          {
            kind: 'paragraph',
            text: '**Effective date:** [[EFFECTIVE_DATE]]',
          },
        ],
      },
      {
        heading: '1. Who is responsible',
        blocks: [
          {
            kind: 'paragraph',
            text: 'The controller of your personal data is [[OPERATOR_NAME]], [[OPERATOR_ADDRESS]], registration number [[OPERATOR_REGISTRATION]] ("Bitrate", "we"). Contact for privacy matters: [[LEGAL_CONTACT_EMAIL]]. We have not appointed a data protection officer [[DPO_NOTE]].',
          },
        ],
      },
      {
        heading: '2. Who this applies to',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Bitrate is for people aged **16 or over**. We do not knowingly collect data from younger children; contact us if you believe a child has registered so we can delete the account.',
          },
        ],
      },
      {
        heading: '3. What we collect, why, and on what legal basis',
        blocks: [
          {
            kind: 'table',
            header: ['Data', 'Purpose', 'Legal basis (GDPR Art. 6)'],
            rows: [
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
                'Sign-in identity from Google or Facebook (provider id, email, name)',
                'Sign in with a social account',
                'Contract',
              ],
              [
                'Playlists, likes, follows, notifications',
                'Provide the features you use',
                'Contract',
              ],
              [
                'Listening history, search history, player state',
                'Provide recents, queue and recommendations-related features',
                'Contract; legitimate interest in improving the service',
              ],
              [
                'Content you upload (audio, covers, titles, metadata), if you are an artist',
                'Host and stream your releases',
                'Contract',
              ],
              [
                'IP address and request details, recorded for write operations in an audit log',
                'Security, abuse prevention and accountability',
                'Legitimate interest (6(1)(f))',
              ],
              [
                'Error reports, performance traces and, for a sample of sessions, session recordings (Sentry)',
                'Find and fix bugs',
                'Legitimate interest [[REPLAY_LEGAL_BASIS — to be decided; see #178]]',
              ],
              [
                'Reports you file, and reports filed about you',
                'Moderation and legal compliance',
                'Legal obligation (6(1)(c)); legitimate interest',
              ],
              [
                'Records of the Terms of Use and Community Guidelines version you accepted, the Privacy Policy version shown to you, and when',
                'Prove consent and contractual acceptance',
                'Legal obligation; legitimate interest',
              ],
            ],
          },
          {
            kind: 'paragraph',
            text: 'Where we rely on legitimate interest you may object (section 8).',
          },
        ],
      },
      {
        heading: '4. Cookies and similar technologies',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Bitrate sets cookies that are **strictly necessary** to sign you in and keep your session secure: your session tokens, a short-lived token while you complete two-factor sign-in, and two short-lived cookies during social sign-in (one protects the sign-in from forgery, the other remembers that you accepted these documents while you are at the provider). They do not require consent. We do not use advertising or analytics cookies.',
          },
          {
            kind: 'paragraph',
            text: 'In the listener web app, our error-monitoring tool (Sentry) may record error details and, for a sample of sessions, session replays that capture how the interface is used. [[REPLAY_NOTE — update after the decision on whether replay is disabled or consent-gated]]',
          },
        ],
      },
      {
        heading: '5. Who receives your data',
        blocks: [
          {
            kind: 'paragraph',
            text: 'We use service providers (processors) under data processing agreements:',
          },
          {
            kind: 'table',
            header: [
              'Provider',
              'What reaches it',
              'Location / transfer safeguard',
            ],
            rows: [
              [
                'Sentry',
                'Errors, traces, session replays',
                '[[SENTRY_REGION_AND_SAFEGUARD]]',
              ],
              [
                'Google (if you use Google sign-in)',
                'Sign-in identity',
                '[[TRANSFER_SAFEGUARD]]',
              ],
              [
                'Meta (if you use Facebook sign-in)',
                'Sign-in identity',
                '[[TRANSFER_SAFEGUARD]]',
              ],
              [
                'Object storage provider',
                'Audio files and images',
                '[[STORAGE_PROVIDER_AND_REGION]]',
              ],
              [
                'Email provider',
                'Your email address and the content of service emails',
                '[[EMAIL_PROVIDER_AND_REGION]]',
              ],
              [
                'Hosting provider',
                'All data processed by the service',
                '[[HOSTING_PROVIDER_AND_REGION]]',
              ],
            ],
          },
          {
            kind: 'paragraph',
            text: 'We do not sell personal data. Other users see the profile information, playlists and public activity you choose to make public in the product. We may disclose data when required by law or to protect rights.',
          },
        ],
      },
      {
        heading: '6. Transfers outside the EEA',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Where a provider is outside the European Economic Area we rely on [[TRANSFER_MECHANISM — adequacy decision, standard contractual clauses, etc.]].',
          },
        ],
      },
      {
        heading: '7. How long we keep data',
        blocks: [
          {
            kind: 'paragraph',
            text: '[[RETENTION_ACCOUNT]] for account data after you delete your account. [[RETENTION_LISTENING_HISTORY]] for listening and search history. [[RETENTION_AUDIT_LOG]] for audit logs including IP addresses. [[RETENTION_REPORTS]] for moderation records.',
          },
          {
            kind: 'note',
            text: 'No retention policy exists yet. These periods must be decided before this document is published.',
          },
        ],
      },
      {
        heading: '8. Your rights',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Under GDPR you have the right to: access your data (Art. 15), correct it (16), have it erased (17), restrict processing (18), receive it in a portable format (20), object to processing based on legitimate interest (21), and withdraw consent at any time where processing is based on consent. Contact [[LEGAL_CONTACT_EMAIL]]. We aim to respond within one month.',
          },
          {
            kind: 'note',
            text: 'Self-service access, export and erasure are not yet implemented in the product. Until they are, requests are handled by email. Adjust this wording to match what exists at release.',
          },
          {
            kind: 'paragraph',
            text: 'You also have the right to lodge a complaint with the Polish supervisory authority, the President of the Personal Data Protection Office (**UODO**), ul. Stawki 2, 00-193 Warsaw, https://uodo.gov.pl, or with the authority in your own EU country.',
          },
        ],
      },
      {
        heading: '9. Security',
        blocks: [
          {
            kind: 'paragraph',
            text: 'We use technical and organisational measures including hashed passwords, optional two-factor authentication, access controls and account lockout after repeated failed sign-ins. No system is perfectly secure; we handle personal-data breaches as required by GDPR Art. 33–34.',
          },
        ],
      },
      {
        heading: '10. Automated decisions',
        blocks: [
          {
            kind: 'paragraph',
            text: 'We do not make decisions that produce legal effects on you based solely on automated processing.',
          },
        ],
      },
      {
        heading: '11. Changes',
        blocks: [
          {
            kind: 'paragraph',
            text: 'We will tell you about material changes before they take effect and record the version you accept.',
          },
        ],
      },
    ],
  },
  {
    slug: 'community',
    title: 'Community Guidelines',
    sections: [
      {
        heading: null,
        blocks: [
          {
            kind: 'paragraph',
            text: '**Effective date:** [[EFFECTIVE_DATE]]',
          },
          {
            kind: 'paragraph',
            text: 'Bitrate is a place for music and the people who make and enjoy it. These guidelines explain what is and is not allowed. They form part of the [Terms of Use](terms).',
          },
        ],
      },
      {
        heading: 'What we expect',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              'Upload only music and audio you have the right to share.',
              'Be honest about who you are and what you publish: no impersonation, no misleading titles or artwork.',
              'Mark explicit content correctly.',
              'Treat other people with respect.',
            ],
          },
        ],
      },
      {
        heading: 'What is not allowed',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              '**Infringing content.** Uploads that you do not have the rights to. See [Copyright and notice-and-action](copyright).',
              '**Illegal content.** Anything unlawful where we operate, including content that sexually exploits minors, incites violence or terrorism, or is otherwise illegal under EU or Polish law.',
              '**Hate and harassment.** Content that attacks people for protected characteristics, targeted harassment, threats or doxxing.',
              '**Deception.** Fake accounts, spam, artificial plays, likes or follows, and phishing or malware.',
              '**Interference.** Attempts to disrupt, scrape or reverse-engineer the service beyond what the law allows.',
            ],
          },
        ],
      },
      {
        heading: 'Reporting',
        blocks: [
          {
            kind: 'paragraph',
            text: 'You can report content or accounts by email to tesluakevlad@gmail.com; see [Complaints and reports](complaints) for what to include. Playlists can also be reported from the report option in the app. Reports of alleged copyright infringement should follow the dedicated process.',
          },
        ],
      },
      {
        heading: 'What happens after a report',
        blocks: [
          {
            kind: 'paragraph',
            text: 'We review reports, may remove or restrict content, and may warn, suspend or terminate accounts. When we restrict content or an account we will tell the affected person why and explain how to contest the decision, as required by applicable law. [[ENFORCEMENT_DETAILS — to be finalised once the review workflow exists]]',
          },
        ],
      },
      {
        heading: 'Repeat violations',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Accounts that repeatedly violate these guidelines, including repeat copyright infringers, may be permanently terminated.',
          },
        ],
      },
    ],
  },
  {
    slug: 'complaints',
    title: 'Complaints and reports',
    sections: [
      {
        heading: null,
        blocks: [
          {
            kind: 'paragraph',
            text: '**Effective date:** [[EFFECTIVE_DATE]]',
          },
          {
            kind: 'paragraph',
            text: 'Use this page to report content or an account, to contest a moderation decision, to make a complaint about Bitrate, or to make a privacy request. Send everything to **tesluakevlad@gmail.com**. One address is used for all of it; put the type of message in the subject line so it reaches the right review.',
          },
        ],
      },
      {
        heading: 'How to contact us',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Email **tesluakevlad@gmail.com** with one of the subject lines below.',
          },
          {
            kind: 'table',
            header: ['Subject line', 'Use it to', 'Include'],
            rows: [
              [
                'Report: content',
                'Report content or an account that is illegal or breaks the [Community Guidelines](community)',
                'The exact URL, why it is illegal or against the guidelines, and your name and email (not required for child sexual abuse material)',
              ],
              [
                'Notice of alleged infringement',
                'Report suspected copyright infringement',
                'Follow [Copyright and notice-and-action](copyright); the five elements listed there are required',
              ],
              [
                'Appeal: decision',
                'Contest a decision we took about your content or account',
                'The account or content concerned, the decision you received, and why you think it is wrong',
              ],
              [
                'Complaint',
                'Complain about the service or how a report was handled',
                'What happened, when, and what outcome you expect',
              ],
              [
                'Privacy request',
                'Ask for access, correction, erasure, restriction, portability, or object to processing',
                'Your account email and the right you want to use; see the [Privacy Policy](privacy)',
              ],
            ],
          },
        ],
      },
      {
        heading: 'What we do with your message',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              'We acknowledge receipt.',
              'We assess it in a timely, diligent and objective manner. Appeals are looked at by a person, not decided only by automated means.',
              'We reply with the outcome and the reasons, and tell you how to contest it further.',
              'We aim to reply within [[COMPLAINT_RESPONSE_DAYS]] days. Privacy requests are answered within one month.',
            ],
          },
        ],
      },
      {
        heading: 'If you disagree with our answer',
        blocks: [
          {
            kind: 'paragraph',
            text: 'You can always go to court. In addition:',
          },
          {
            kind: 'list',
            ordered: false,
            items: [
              '**Out-of-court dispute settlement.** If you are in the EU you may take a content-moderation decision to a certified out-of-court dispute settlement body under the Digital Services Act. [[ODS_BODY_NOTE — name a certified body, or state that none is selected yet]]',
              '**Data protection.** You may complain to the President of the Personal Data Protection Office (UODO), https://uodo.gov.pl, or to the authority in your own EU country.',
              '**Consumer matters.** In Poland you can seek help from a consumer ombudsman or the Office of Competition and Consumer Protection (UOKiK), https://uokik.gov.pl.',
            ],
          },
        ],
      },
      {
        heading: 'Notes',
        blocks: [
          {
            kind: 'note',
            text: 'The address above is a temporary single contact for the draft. Replace it with the operator contact address before publication. A web form and an in-app report option for tracks, albums and accounts are planned; today the in-app option covers playlists only.',
          },
        ],
      },
    ],
  },
  {
    slug: 'copyright',
    title: 'Copyright and notice-and-action',
    sections: [
      {
        heading: null,
        blocks: [
          {
            kind: 'paragraph',
            text: '**Effective date:** [[EFFECTIVE_DATE]]',
          },
          {
            kind: 'paragraph',
            text: 'Bitrate respects the rights of creators. This page explains how to tell us about content you believe infringes copyright or is otherwise illegal, and how uploaders can respond. It reflects the notice-and-action rules of the EU Digital Services Act (Art. 16) and the established notice-and-takedown model.',
          },
        ],
      },
      {
        heading: 'How to submit a notice',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Send an email to **[[LEGAL_CONTACT_EMAIL]]** with the subject "Notice of alleged infringement". A web form is planned but not available yet. Your notice must contain:',
          },
          {
            kind: 'list',
            ordered: true,
            items: [
              '**Your details** — name and email address (not required for notices about child sexual abuse material).',
              '**The content** — the exact URL(s) of the page, track, album or profile you are reporting.',
              '**Your reasons** — a sufficiently substantiated explanation of why the content is illegal or infringing, including, for copyright, what work is infringed and your relationship to it (owner or authorised agent).',
              '**Good-faith statement** — that you believe in good faith that the information in the notice is accurate and complete.',
              '**Signature** — an electronic or physical signature of the owner or authorised agent.',
            ],
          },
          {
            kind: 'paragraph',
            text: 'Incomplete notices may take longer to process or be rejected.',
          },
        ],
      },
      {
        heading: 'What we do',
        blocks: [
          {
            kind: 'list',
            ordered: false,
            items: [
              'We acknowledge receipt of your notice.',
              'We assess it in a timely, diligent and objective manner.',
              'If the notice is justified we remove or disable access to the content and tell the uploader, with the reasons.',
              'We tell you our decision and the available ways to contest it.',
            ],
          },
        ],
      },
      {
        heading: 'Counter-notice',
        blocks: [
          {
            kind: 'paragraph',
            text: 'If your content was removed and you believe that was a mistake, reply to the notification within [[COUNTER_NOTICE_DAYS]] days stating the content concerned, why you believe the removal was wrong (for example that you own the rights or hold a licence), and your contact details. We may restore the content or ask the notifier to pursue the matter in court.',
          },
        ],
      },
      {
        heading: 'Repeat infringers',
        blocks: [
          {
            kind: 'paragraph',
            text: 'We terminate the accounts of users who repeatedly upload infringing content, after warning where appropriate.',
          },
        ],
      },
      {
        heading: 'False notices',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Knowingly submitting a false notice may expose you to legal liability, including damages.',
          },
        ],
      },
      {
        heading: 'US rights holders',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Rights holders who wish to rely on the US Digital Millennium Copyright Act may use the same process. Notices that meet the elements above are treated as DMCA notices. [[DMCA_AGENT — designate an agent with the US Copyright Office only if counsel advises]]',
          },
        ],
      },
      {
        heading: 'Contact',
        blocks: [
          {
            kind: 'paragraph',
            text: '[[OPERATOR_NAME]], [[OPERATOR_ADDRESS]] — [[LEGAL_CONTACT_EMAIL]].',
          },
        ],
      },
    ],
  },
]
