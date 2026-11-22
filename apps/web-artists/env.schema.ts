import { z } from 'zod'

/**
 * Build-time origins a deployable artists-portal image must carry.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time and the source keeps a localhost fallback
 * for each so a developer machine with no `.env` still runs. An image built without them
 * therefore ships those fallbacks — which is how the production portal linked albums to
 * `http://localhost:3001`. The Dockerfile sets `ENFORCE_DEPLOY_ENV`, and `vite.config.ts` then
 * refuses to build unless every value below is a real public origin.
 *
 * The deployment variables keep their shared names (`NEXT_PUBLIC_API_URL`,
 * `NEXT_PUBLIC_SITE_URL`); compose and CI map them to these `VITE_` names at this app's boundary.
 */
const DEPLOY_ORIGIN_KEYS = ['VITE_API_URL', 'VITE_PLAYER_URL'] as const

/** One of the origins {@link DEPLOY_ORIGIN_KEYS} names. */
type DeployOriginKey = (typeof DEPLOY_ORIGIN_KEYS)[number]

/** Hostnames that can never be a deployed origin. */
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0'])

/**
 * A public HTTPS origin with no path, query or hash. An empty string counts as missing: a
 * Dockerfile's `ENV X=${X}` sets `""` when the build arg was not supplied.
 */
const deployOrigin = (key: DeployOriginKey) =>
  z
    .string({ error: `${key} is required for a deployable build` })
    .min(1, `${key} is required for a deployable build`)
    .pipe(z.url(`${key} must be an absolute URL`))
    .refine((value) => new URL(value).protocol === 'https:', {
      message: `${key} must use HTTPS in a deployable build`,
    })
    .refine((value) => !LOCAL_HOSTNAMES.has(new URL(value).hostname), {
      message: `${key} cannot point to a local host in a deployable build`,
    })
    .refine(
      (value) => {
        const url = new URL(value)
        return url.pathname === '/' && !url.search && !url.hash
      },
      { message: `${key} must be an origin without a path, query or hash` },
    )

const deployEnvSchema = z.object({
  VITE_API_URL: deployOrigin('VITE_API_URL'),
  VITE_PLAYER_URL: deployOrigin('VITE_PLAYER_URL'),
})

/** The validated build-time origins of a deployable image. */
export type DeployEnv = z.infer<typeof deployEnvSchema>

/** Input for {@link assertDeployEnv}. */
export type AssertDeployEnvInput = {
  /** The build's environment: `process.env` merged with Vite's loaded `.env` files. */
  environment: Record<string, string | undefined>
}

/**
 * Throws, naming every offending variable, unless the build carries real deploy origins.
 * Only called for a deployable build; lint, typecheck, tests and local builds skip it.
 */
export function assertDeployEnv({
  environment,
}: AssertDeployEnvInput): DeployEnv {
  const result = deployEnvSchema.safeParse(environment)
  if (result.success) return result.data

  const problems = result.error.issues.map((issue) => `  - ${issue.message}`)
  throw new Error(
    `Refusing to build a deployable web-artists image:\n${problems.join('\n')}`,
  )
}
