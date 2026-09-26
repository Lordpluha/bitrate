---
paths:
  - "apps/admin/**"
---

# Angular admin boundaries

- Angular zoneless SPA; no React/FSD/Next.js rules. Use the existing Angular/spartan-ng APIs.
- Dependencies point inward: domain is framework-free; application uses domain and Angular
  DI; infrastructure owns HTTP/zod/mapping; presentation uses application/domain.
  Only composition roots wire repository ports to adapters.
- Ports are abstract classes. Adapters extend them without providedIn; components inject
  use cases, never repositories. Domain policy is pure; map transport fields in infrastructure.
- Parse API responses with zod and bind DTOs to generated contracts. Preserve cookie auth
  and refresh behavior; never expose tokens to JavaScript. No query cache without a new ADR.
- Screens/routes/sidebar share permission policy. Preserve staff-session floor and route
  permissions; stored permissions are added/deprecated, not renamed. Protected staff/role
  grants stay rejected. Route ordering must not turn literal paths into ids.
- List filters/pagination/sort live in the URL with canonical encoding and safe defaults.
- Forms use Reactive Forms with the FormGroup-level zod bridge.
- Consume ui-react CSS tokens, never its React runtime. Follow local UI components.
- Configuration uses the existing generated module; never read real env files to debug it.
- ESLint + Prettier; tests use Angular's Vitest builder and the configured spec inclusion.
- Read the relevant section of `.claude/references/admin-rules-guide.md` before changing
  permissions, wire schemas, list state, forms, configuration or builder behavior.
