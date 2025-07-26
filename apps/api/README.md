<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">@spotify/api</h1>

## Description

## Project setup
1. Install dependencies
```bash
$ pnpm ci
```

2. Start your first migration (needs db to be started)
```bash
$ pnpm run db:migration:start
```

> if you have problems try to use:
> ```bash
> pnpm run db:generate
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
# prettier
$ pnpm run format

# eslint
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
$ pnpm run db:generate

# generate in production
$ pnpm run db:generate:prod
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

## License
Nest is [MIT licensed](https://github.com/Lordpluha/spotify-clone/LICENSE).
