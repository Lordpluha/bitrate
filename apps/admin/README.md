# @bitrate/admin

The Bitrate operator panel: an Angular zoneless SPA on spartan-ng
([ADR-0035](../docs/docs/architecture/0035-admin-panel-on-angular.md)). Screens, architecture and
tests are described in the [Admin Panel docs](../docs/docs/applications/admin/overview.md).

```bash
pnpm --filter @bitrate/admin dev         # dev server on ADMIN_PORT (3005 in the example env)
pnpm --filter @bitrate/admin test:unit   # Vitest
pnpm --filter @bitrate/admin lint        # ESLint
pnpm --filter @bitrate/admin build
```
