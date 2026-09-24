---
paths:
  - "apps/**"
  - "packages/**"
---

# Shared project boundaries

- Follow the affected workspace's architecture and installed configuration. Angular,
  Next.js, TanStack Start, Svelte, React Native and Tauri have distinct conventions.
- Use pnpm and public package exports. Read current package.json/tsconfig for commands
  and aliases; do not infer package availability from historical documentation.
- Preserve user changes, generated contracts, architecture boundaries and existing gates.
- Reuse an existing abstraction when it fits. Avoid unrelated cleanup and new dependencies
  without a task-specific reason. Follow the owning workspace for naming and structure.
- Language rules, UI rules, testing and release workflows have their own owners;
  do not load their manuals merely because this rule matched.
