---
paths:
  - "apps/**/*.tsx"
  - "packages/**/*.tsx"
---

# Component design review signals

- Prefer cohesive components and small public interfaces. Extract a concern when doing so
  improves comprehension, reuse or testing; avoid abstractions for speculative consumers.
- Around 100 logic lines, more than 5 own props or more than 2 effects trigger review,
  not automatic failure or decomposition. Explain retain/split briefly in the review.
  No mandatory justification comments in production source; no unrelated refactoring.
- Evaluate responsibilities, coupled state and external synchronization, not just counts.
  Group props only when they form a real domain concept.
- Preserve framework contracts, ref forwarding and accessibility. Extraction follows the
  workspace's architecture; this rule does not impose FSD on native or other apps.
