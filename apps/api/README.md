<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">@bitrate/api</h1>

## Description

## Project setup
1. Install dependencies
```bash
$ pnpm install
```

2. Start your first migration (needs db to be started)
```bash
$ pnpm run db:migration:start
```

> if you have problems try to use:
> ```bash
> pnpm run db:gen
> ```

3. Run your prisma server and app
```bash
$ pnpm run db:start && pnpm run start
```

## Scripts
### Start project
```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# debug mode
$ pnpm run start:debug

# production mode
$ pnpm run start:prod
```

### Linting and formating
```bash
$ pnpm run format

$ pnpm run lint
```

### Prisma
```bash
# start in development mode
$ pnpm run db:start

# start migrations in dev (needed for work)
$ pnpm run db:migration:start

# reset migrations
$ pnpm run db:migration:reset

# generate in dev
$ pnpm run db:gen

# generate in production
$ pnpm run db:gen:prod
```

### Tests
```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Development email verification

Registration requires email verification. The preferred local/CI setup is a real test SMTP
transport such as MailHog, configured through `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, and `EMAIL_FROM`.

`task dev:up` starts MailHog automatically; delivered messages are visible at
`http://localhost:8025`. For a natively running API, `task infra:up` exposes SMTP on port `1025`;
set `SMTP_HOST=localhost`, `SMTP_PORT=1025`, and `EMAIL_FROM=no-reply@bitrate.local`.

For isolated local development only, set `DEV_MAIL_LOG_TOKENS=true`. When SMTP is unavailable,
the API then prints the complete verification/reset URL; open that URL in the matching user or
artist frontend to finish the flow. The flag is opt-in, defaults to `false`, and environment
validation rejects it when `NODE_ENV=production`. CI/E2E must use an SMTP transport and must not
depend on token logging.

## License
Nest is [MIT licensed](https://github.com/Lordpluha/bitrate/LICENSE).
