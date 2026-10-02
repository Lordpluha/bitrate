---
id: privacy-policy
title: Privacy Policy (draft)
draft: true
---

:::warning[Draft — pending legal review]
Draft for lawyer review. It describes what the system does **today**, based on the repository audit in the
[Law roadmap](../strategy/law-roadmap.md). Retention periods and some rights are not decided or implemented yet;
those spots are marked with placeholders. Do not publish.
:::

**Effective date:** [[EFFECTIVE_DATE]]

## 1. Who is responsible

The controller of your personal data is [[OPERATOR_NAME]], [[OPERATOR_ADDRESS]], registration number
[[OPERATOR_REGISTRATION]] ("Bitrate", "we"). Contact for privacy matters: [[LEGAL_CONTACT_EMAIL]].
We have not appointed a data protection officer [[DPO_NOTE]].

## 2. Who this applies to

Bitrate is for people aged **16 or over**. We do not knowingly collect data from younger children; contact us if you
believe a child has registered so we can delete the account.

## 3. What we collect, why, and on what legal basis

| Data | Purpose | Legal basis (GDPR Art. 6) |
|---|---|---|
| Email, username, password hash, avatar, profile description, interface language | Create and run your account, send service emails (verification, password reset) | Contract (6(1)(b)) |
| Two-factor secret (if you enable 2FA), sessions and device records | Secure sign-in, keep you signed in, show your devices | Contract; legitimate interest in security (6(1)(f)) |
| Sign-in identity from Google or Facebook (provider id, email, name) | Sign in with a social account | Contract |
| Playlists, likes, follows, notifications | Provide the features you use | Contract |
| Listening history, search history, player state | Provide recents, queue and recommendations-related features | Contract; legitimate interest in improving the service |
| Content you upload (audio, covers, titles, metadata), if you are an artist | Host and stream your releases | Contract |
| IP address and request details, recorded for write operations in an audit log | Security, abuse prevention and accountability | Legitimate interest (6(1)(f)) |
| Error reports, performance traces and, for a sample of sessions, session recordings (Sentry) | Find and fix bugs | Legitimate interest [[REPLAY_LEGAL_BASIS — to be decided; see #178]] |
| Reports you file, and reports filed about you | Moderation and legal compliance | Legal obligation (6(1)(c)); legitimate interest |
| Records of the Terms of Use and Community Guidelines version you accepted, the Privacy Policy version shown to you, and when | Prove consent and contractual acceptance | Legal obligation; legitimate interest |

Where we rely on legitimate interest you may object (section 8).

## 4. Cookies and similar technologies

Bitrate sets cookies that are **strictly necessary** to sign you in and keep your session secure: your session tokens, a
short-lived token while you complete two-factor sign-in, and two short-lived cookies during social sign-in (one protects the
sign-in from forgery, the other remembers that you accepted these documents while you are at the provider). They do not require
consent. We do not use advertising or analytics cookies.

In the listener web app, our error-monitoring tool (Sentry) may record error details and, for a sample of sessions, session
replays that capture how the interface is used. [[REPLAY_NOTE — update after the decision on whether replay is disabled or consent-gated]]

## 5. Who receives your data

We use service providers (processors) under data processing agreements:

| Provider | What reaches it | Location / transfer safeguard |
|---|---|---|
| Sentry | Errors, traces, session replays | [[SENTRY_REGION_AND_SAFEGUARD]] |
| Google (if you use Google sign-in) | Sign-in identity | [[TRANSFER_SAFEGUARD]] |
| Meta (if you use Facebook sign-in) | Sign-in identity | [[TRANSFER_SAFEGUARD]] |
| Object storage provider | Audio files and images | [[STORAGE_PROVIDER_AND_REGION]] |
| Email provider | Your email address and the content of service emails | [[EMAIL_PROVIDER_AND_REGION]] |
| Hosting provider | All data processed by the service | [[HOSTING_PROVIDER_AND_REGION]] |

We do not sell personal data. Other users see the profile information, playlists and public activity you choose to make
public in the product. We may disclose data when required by law or to protect rights.

## 6. Transfers outside the EEA

Where a provider is outside the European Economic Area we rely on [[TRANSFER_MECHANISM — adequacy decision, standard contractual clauses, etc.]].

## 7. How long we keep data

[[RETENTION_ACCOUNT]] for account data after you delete your account. [[RETENTION_LISTENING_HISTORY]] for listening and
search history. [[RETENTION_AUDIT_LOG]] for audit logs including IP addresses. [[RETENTION_REPORTS]] for moderation records.

:::caution
No retention policy exists yet. These periods must be decided before this document is published.
:::

## 8. Your rights

Under GDPR you have the right to: access your data (Art. 15), correct it (16), have it erased (17), restrict processing (18),
receive it in a portable format (20), object to processing based on legitimate interest (21), and withdraw consent at any
time where processing is based on consent. Contact [[LEGAL_CONTACT_EMAIL]]. We aim to respond within one month.

:::caution
Self-service access, export and erasure are not yet implemented in the product. Until they are, requests are handled by email.
Adjust this wording to match what exists at release.
:::

You also have the right to lodge a complaint with the Polish supervisory authority, the President of the Personal Data
Protection Office (**UODO**), ul. Stawki 2, 00-193 Warsaw, https://uodo.gov.pl, or with the authority in your own EU country.

## 9. Security

We use technical and organisational measures including hashed passwords, optional two-factor authentication, access
controls and account lockout after repeated failed sign-ins. No system is perfectly secure; we handle personal-data
breaches as required by GDPR Art. 33–34.

## 10. Automated decisions

We do not make decisions that produce legal effects on you based solely on automated processing.

## 11. Changes

We will tell you about material changes before they take effect and record the version you accept.
