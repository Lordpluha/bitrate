# 🎨 Style Guide

## Frontend (Next.js + FSD)

- Use **Feature-Sliced Design**
- Group components by domain not type
- Naming:
  - Component: `Player.tsx`
  - Styles: `Player.module.css`
- Styling:
  - Tailwind for layout/states
  - Module.css for component-level overrides

## Backend (NestJS)

- Use modular structure
- Controllers → Services → UseCases → Repositories
- Zod for validation and OpenAPI contracts
- DTOs and contracts in `packages/contracts`

## Code Conventions

- Format with Prettier
- Use ESLint and Stylelint
- Use Zod schemas to describe and validate configs
