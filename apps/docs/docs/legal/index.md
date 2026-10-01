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
| [Terms of Use](./terms-of-use.md) | web-player, web-artists |
| [Privacy Policy](./privacy-policy.md) | web-player, web-artists |
| [Community Guidelines](./community-guidelines.md) | web-player, web-artists |
| [Copyright and notice-and-action](./copyright-notice-and-action.md) | web-player, web-artists |
| [Artist Agreement](./artist-agreement.md) | web-artists only |

## Placeholders

Operator details do not exist yet, so every draft uses the same placeholders. Replace them in one
pass when the operator is established.

| Placeholder | Meaning |
|---|---|
| `[[OPERATOR_NAME]]` | Legal name of the operator (the data controller) |
| `[[OPERATOR_ADDRESS]]` | Registered address |
| `[[OPERATOR_REGISTRATION]]` | Company or business registration number |
| `[[LEGAL_CONTACT_EMAIL]]` | Single contact address for legal and privacy requests (one constant in the apps) |
| `[[GOVERNING_LAW]]` | Governing law and courts; Poland is the working assumption |
| `[[RETENTION_*]]` | Retention periods that are not yet decided (see open items) |
| `[[EFFECTIVE_DATE]]` | Date of the revision; also the value of the stored `legalVersion` |

## Open items a lawyer or the founder must settle

- **Retention periods.** No retention policy exists; `AuditLog`, `ListeningHistory` and logged IP
  addresses currently grow without limit. The Privacy Policy cannot be finalised until periods are chosen.
- **Session Replay.** Sentry Replay is enabled with no consent gate. The Privacy Policy draft describes it
  as it is today; the decision to disable it or gate it behind consent belongs to #178.
- **Erasure, access and portability.** The policy promises GDPR rights that the product does not yet
  implement (see Gate 1 in the roadmap). Wording must match what is actually offered at release time.
- **Artist Agreement.** The roadmap places this at Gate 3 and marks it as the contract worth paying counsel
  for. This draft covers only the hosting licence needed for uploads today, not distribution or royalties.
- **Explicit-content default and age assurance.** The product has no age check; the drafts state a minimum
  age of 16 as a contractual rule only.

## Release gate

Do not ship these texts to production until **both** are true: operator details are filled in, and a
lawyer in the operating jurisdiction has reviewed them.
