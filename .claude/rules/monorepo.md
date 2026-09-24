---
paths:
  - "package.json"
  - "pnpm-workspace.yaml"
  - "turbo.json"
  - "Taskfile.yml"
  - "apps/*/package.json"
  - "packages/*/package.json"
  - "infra/**"
---

# Monorepo tooling

- pnpm only. Current package manifests and pnpm-workspace.yaml own workspace/scripts,
  overrides and peer rules; verify installed versions instead of trusting historical notes.
- Turborepo task dependencies/caching must match real inputs and outputs. Prefer scoped
  workspace commands; root checks require a scope-based reason.
- Taskfile.yml owns Docker/database/monitoring workflows. Preserve running user services.
- Use public package exports and existing asset generators. ui-react owns hand-written
  design-token CSS; generated contracts/assets should be changed via their producer.
- Do not weaken pins, peer policy, compiler/linter gates or pre-push checks to obtain a pass.
- Preserve package entrypoints, build outputs and consumers when adding/changing packages.
- For toolchain/asset/environment/release changes read the relevant section of
  `.claude/references/monorepo-guide.md`, checking historical version claims against manifests.
