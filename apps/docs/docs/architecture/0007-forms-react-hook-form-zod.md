# ADR-0007: React Hook Form + Zod

Status: Accepted

Date: 2026-06-24

## Context

Authentication and future editing workflows require typed validation, accessible errors,
server-error projection, and reusable field composition.

## Decision

- Zod schemas are the validation source of truth.
- Types are inferred with `z.infer`.
- React Hook Form owns form state and submission.
- `zodResolver` connects both layers.
- Native controls use `register`; controlled package components use `Controller` or the
  existing `@bitrate/ui-react` form wrappers.
- Field errors set `aria-invalid`, connect messages through `aria-describedby`, and expose
  an announced error region.
- Repeated API error mapping is extracted into one shared adapter when the second consumer
  appears.

## Consequences

Features do not duplicate entity validation schemas. Form primitives remain UI concerns;
transport error normalisation remains in the API client layer.

## Alternatives considered

- **Formik** — rejected because RHF is already installed and better matches uncontrolled
  inputs.
- **Hand-written validation** — rejected because schemas and TypeScript types would drift.
