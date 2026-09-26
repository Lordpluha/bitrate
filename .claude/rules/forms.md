---
paths:
  - "apps/web-player/src/**/ui/**/*Form*.tsx"
  - "apps/web-player/src/**/ui/**/*Field*.tsx"
  - "apps/web-player/src/**/model/*schema*"
---

# Web-player forms

- For any form change, including files outside these naming patterns, explicitly load this
  rule and the relevant section of `.claude/references/forms-guide.md`.
- Use the established React Hook Form + zodResolver pattern and shared form components.
- Reuse the owning entity/schema; do not duplicate validation or invent a second form stack.
- Preserve validation timing, controlled values, field/server error mapping, pending state,
  accessible labels/error associations and keyboard submission.
- Do not nest forms. Use the existing form shell/actions and field-array conventions.
- This rule is specific to web-player; Angular uses its own Reactive Forms/zod bridge.
