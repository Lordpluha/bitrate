---
paths:
  - "apps/web-player/src/**/*.tsx"
  - "apps/web-artists/src/**/*.tsx"
  - "apps/desktop/src/**/*.tsx"
  - "packages/ui-react/src/**/*.tsx"
---

# Shared React conventions

- Function components with named exports and named Props types; framework-required default
  exports are allowed at route/framework entrypoints. Use named React imports.
- Follow hook rules. Effects synchronize external systems; derive render values directly
  when possible. More than two effects is a review signal, not a failure by itself.
- Keep state near its owner; follow each app's server-state/client-state stack. Next.js
  server/client boundaries apply only to web-player, not TanStack Start or desktop.
- Preserve loading, empty, error and disabled states, keyboard access and focus behavior.
- Reuse ui-react where the workspace already consumes it; preserve its public interfaces.
- Memoize based on a demonstrated need and the workspace compiler/runtime, not reflexively.
- Size/props review policy is owned by `code-principles.md`; styling has a separate rule.
- For a specific React recipe read the relevant section of `.claude/references/react-guide.md`;
  sections explicitly about web-player are not conventions for other apps.
