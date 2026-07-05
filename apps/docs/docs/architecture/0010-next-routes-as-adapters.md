# ADR-0010: App Router files stay thin; views own screens

Status: Accepted

Date: 2026-06-24

## Context

Next.js route files can easily accumulate screen composition, interaction logic, and data
transformations, duplicating the FSD `views` layer.

## Decision

- `app/**/page.tsx` and layouts are routing/framework adapters.
- Full-screen composition lives in `views/<Name>View`.
- Route files may read params/search data, call server-only loaders, and pass serialisable
  values into the view.
- Route handlers validate transport input and delegate domain work; they do not duplicate
  NestJS business logic.
- Framework-required default exports are the exception to the named-component-export rule.

## Consequences

Views remain reusable and testable without pretending Next.js filesystem routes do not
exist. Review checklist Route-1/Route-2 enforce central navigation and thin adapters.

## Alternatives considered

- **Inline full pages in every route file** — rejected because layer ownership becomes
  inconsistent.
- **Remove the views layer** — rejected because it is already the screen-composition
  contract for web-player.
