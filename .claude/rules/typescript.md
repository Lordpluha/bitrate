---
paths:
  - "apps/**/*.ts"
  - "apps/**/*.tsx"
  - "packages/**/*.ts"
  - "packages/**/*.tsx"
---

# TypeScript requirements

- Preserve the workspace's compiler strictness; fix diagnostics at their source.
- No production explicit/implicit `any` or `@ts-ignore`. Narrow `unknown` at boundaries.
  `@ts-expect-error` is for documented negative type-contract tests only.
- Assertions require proof; validate external inputs at runtime. Catch values stay unknown.
- Name domain shapes and literal unions in signatures/generic arguments; keep types near
  their owner. Nullable/optional primitive plumbing can remain inline.
- Use type-only imports where appropriate, but preserve runtime values needed for Nest DI.
- Follow workspace aliases and naming. Do not impose web-player parameter conventions
  or Next.js imports on other workspaces. Generated code keeps its generator's conventions.
- Use async/await over raw Promise chains; propagate failures meaningfully and handle outstanding promises.
- Use named constants for domain policy. Document public contracts and non-obvious rationale;
  leave formatting/whitespace to the configured tools.
- Put focused behavior tests with their owner; `testing.md` routes framework-specific work.
- Examples and naming details: `.claude/references/typescript-guide.md`, relevant section only.
