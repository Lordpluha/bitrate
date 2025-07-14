# 🗂 Project Structure

## apps/

Contains the individual applications:
- **client/**: Next.js 15 frontend app
- **api/**: NestJS REST API + Websockets
- **admin/**: Admin panel based on NestJS Admin
- **mobile/**: React Native application

## packages/

Shared libraries and logic:
- **ui/**: Reusable UI components (shadcn-based) with storybook
- **contracts/**: Zod/OpenAPI contracts
- **eslint/**: Eslint shared configs
- **prettier/**: Prettier shared config
- **stylelint/**: Stylelint shared config

## docs/

Project documentation used with Mintlify:
- `architecture.md`
- `deployment.md`
- `style-guide.md`
- `env.md`
