---
id: index
title: Legal drafts
sidebar_position: 1
draft: true
---

:::danger[Drafts — not legal advice, not for publication]
Everything in this folder is an **engineering draft** prepared so a lawyer can review a complete
starting point. None of it has been reviewed by counsel. Do not publish, link from production,
or rely on any of these texts until the release gate at the bottom of this page is cleared.
:::

The documents follow the [Law roadmap](../strategy/law-roadmap.md) (Gate 0 and Gate 1) and the
decisions in the planning epic. The operator is based in **Poland (EU)**, so GDPR, the DSA and
the Polish digital-consent age (16) are the baseline.

| Draft | Applies to |
|---|---|
| [Terms of Use](./terms-of-use.md) — **published** | web-player, web-artists |
| [Privacy Policy](./privacy-policy.md) — **published** | web-player, web-artists |
| [Community Guidelines](./community-guidelines.md) | web-player, web-artists |
| [Complaints and reports](./complaints.md) | web-player, web-artists |
| [Copyright and notice-and-action](./copyright-notice-and-action.md) | web-player, web-artists |
| [Artist Agreement](./artist-agreement.md) | web-artists only |

## Operator details

The operator details are filled in across every document: Vladyslav Tesliuk, Warsaw, Poland, a
private individual; contact `tesluakevlad@gmail.com`. Every effective date is 1 October 2026, the
value of the stored `legalVersion` (`apps/api/src/common/legal.ts`), so no user has to accept the
documents again. Bump both together when a revision must be re-accepted.

The Privacy Policy and the Terms of Use are published without the draft banner, because Google's
and Meta's sign-in reviews read both on the home-page domain. The Terms are governed by Polish law,
and their liability clause (8.2) keeps every limit EU consumer law requires; it was written without
counsel and is the first clause to have reviewed. Every other document stays a draft and keeps its
remaining placeholders and the clauses marked for counsel.

## Open items a lawyer or the founder must settle

- **Retention enforcement.** The Privacy Policy now states retention periods (account data 30 days
  after deletion, audit logs 12 months, moderation records 3 years). Nothing deletes `AuditLog` rows
  or logged IP addresses after 12 months yet; a cleanup job must make the stated period true.
- **Session Replay.** Kept on (10% of sessions, every session with an error) on the basis of
  legitimate interest, with Sentry's default masking of all text and input. A consent gate stays an
  option under #178.
- **Erasure, access and portability.** The policy promises GDPR rights that the product does not yet
  implement (see Gate 1 in the roadmap). Wording must match what is actually offered at release time.
- **Artist Agreement.** The roadmap places this at Gate 3 and marks it as the contract worth paying counsel
  for. This draft covers only the hosting licence needed for uploads today, not distribution or royalties.
- **Explicit-content default and age assurance.** The product has no age check; the drafts state a minimum
  age of 16 as a contractual rule only.

## Release gate

Do not ship these texts to production until **both** are true: operator details are filled in, and a
lawyer in the operating jurisdiction has reviewed them.
