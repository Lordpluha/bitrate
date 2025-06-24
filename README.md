# Music Platform (Spotify Clone)

# Postman
https://app.getpostman.com/join-team?invite_code=1fd6000a0cd8139ff2657eb1b9ce483c6ae18ac6b3b3877e612ee8bfc60166ea&target_code=47584a9ad7cb0c5ee8c584d35aa1a88e

# Turborepo Tailwind CSS starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest -e with-tailwind
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `web`: another [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)
- `ui`: a stub React component library with [Tailwind CSS](https://tailwindcss.com/) used by `web`
- `@spotify/eslint`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Building packages/ui

This example is set up to produce compiled styles for `ui` components into the `dist` directory. The component `.tsx` files are consumed by the Next.js apps directly using `transpilePackages` in `next.config.ts`. This was chosen for several reasons:

- Make sharing one `tailwind.config.ts` to apps and packages as easy as possible.
- Make package compilation simple by only depending on the Next.js Compiler and `tailwindcss`.
- Ensure Tailwind classes do not overwrite each other. The `ui` package uses a `ui-` prefix for it's classes.
- Maintain clear package export boundaries.

Another option is to consume `packages/ui` directly from source without building. If using this option, you will need to update the `tailwind.config.ts` in your apps to be aware of your package locations, so it can find all usages of the `tailwindcss` class names for CSS compilation.

For example, in [tailwind.config.ts](packages/tailwind/tailwind.config.ts):

```js
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/ui/*.{js,ts,jsx,tsx}",
  ],
```

If you choose this strategy, you can remove the `tailwindcss` and `autoprefixer` dependencies from the `ui` package.

### Utilities

This Turborepo has some additional tools already setup for you:

- [Tailwind CSS](https://tailwindcss.com/) for styles
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

[![Lordpluha](https://img.shields.io/badge/author-@Lordpluha-blue)](https://github.com/Lordpluha)

A full-featured music platform inspired by Spotify, built with a modern monorepo architecture and a fully self-hosted stack.

## 🎯 Project Goals
- Modern, scalable, full-stack application
- Self-hosted to minimize recurring costs
- Learn and apply advanced architecture patterns and DevOps workflows

## 📦 Tech Stack

### Client
- Next.js 15 App Router + Server Actions + middleware
- TurboBuild + ESBuild
- TypeScript, TailwindCSS, Module.css, clsx
- Zustand, React Hook Form + Zod
- i18n, MSW
- @tanstack/react-query (Codegen via openApiTS) + Socket.io
- Storybook, Shadcn UI
- Vitest (unit, integration, E2E), Screenshot testing
- Feature-Sliced Design

### Mobile App
- React Native, NativeBase, Zustand, Faker
- React Navigation
- i18n
- @tanstack/react-query + AsyncStorage + Persistor + Socket.io

### Admin Panel
- NestJS Admin

### Backend
- NestJS, TypeScript
- MongoDB/PostgreSQL via Mongoose/Prisma(TypeORM)
- REST API, SSE, Socket.io, Long-polling, RabbitMQ
- JWT, OAuth, CORS, CSP, 2FA, Redis
- Swagger + Zod (codegen sync)
- Postfix + NodeMailer, Multer
- Contracts, @nestjs/throttler, Fingerprint auth
- ConfigModule, @nestjs/schedule (CRON)
- Prometheus + Grafana, nestjs-pino

### Infrastructure
- Monorepo: TurboRepo + Pnpm
- Linting: ESLint, Prettier, Stylelint
- Git tools: Husky, Lint-staged, Commit-lint, Gitflow
- CI/CD: GitHub Actions, Docker, self-hosted Sentry
- Env: .env per app + .env.schema (Zod-based)
- Backup: `mongodump`, `redis-cli --rdb`
- Docs: Mintlify

### Future Migrations
- GraphQL, Tauri, AdminJS
- Microservices, Micro-Frontends, Web Components
- CDN + S3, Logs, Metrics

## 📄 License

MIT © 2025 Lordpluha
