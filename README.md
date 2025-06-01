# Music Platform (spotify clone)
[@Lordpluha](https://github.com/Lordpluha)

https://www.figma.com/design/HU2gmO1n4uBGYagctQKw6Z/Music-Platform--spotify-clone-?node-id=0-1&p=f&t=FTB5xRME6whYuBSN-0

## Tech Stack
### Client
 - Next v15 App Router + Server Actions + middleware
 - TurboBuild + ESBuild
 - TS
 - TailwindCSS, Module.css, clsx
 - Zod + React-hook-form
 - i18n
 - MSW
 - @tanstack/react-query(Code-generation by openApiTS) + Socket.io
 - Feature-sliced-design
 - Storybook
 - shadcn
 - Unit, Screenshot testing, Intergration, E2E (Vitest)
 - Zustand

### Mobile App
 - React-natives
 - Facker
 - Zustand
 - React Navigation
 - NativeBase
 - i18n
 - @tanstack/react-query(Code-generation by openApiTS) (+persistor and AsyncStorage for offline) + Socket.io

### Admin-panel
- NestJS Admin

### Back
 - Nest
 - TS
 - MongoDB/PostgreSQL + Mongoose/Prisma(TypeORM)
 - RestAPI, SSE, Socket.io, Long-pooling, RabbitMQ
 - JWT, OAuth, CORS, CSP, 2FA
 - Redis
 - Postfix + NodeMailer
 - Swagger + Zod (Code generation sync)
 - Contracts
 - @nestjs/throttler
 - Fingerprint
 - Testing
 - Multer
 - ConfigModule
 - @nestjs/schedule for CRON
 - Prometheus + Grafana

### Infra
 - Prettier, ESLint, Stylelint, Lint-staged, husky.js, Gitflow, commit-lint
 - Pnpm, TurboRepo
 - Github Actions, self-hosted Sentry
 - Docker
 - .env per app
 - mongodump + `redis-cli --rdb`

### Future migrations for learning:
 - GraphQL
 - Tauri
 - AdminJS
 - MicroServices
 - MicroFront-end
 - Web Components
 - CDN + S3
 - Logs
 - Metrics
