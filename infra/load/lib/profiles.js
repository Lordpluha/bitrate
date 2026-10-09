import { DURATION_SCALE, MAX_RATE, MAX_VUS, PROFILE, RATE } from './config.js'

/**
 * Load profiles. Each one describes the *total* arrival rate over time (iterations per second
 * across all scenarios); `buildScenarios` splits it between the traffic mixes by SHARES.
 *
 * Arrival-rate executors (an open model) are used throughout: new iterations start on schedule
 * whether or not earlier ones finished, so a slow API shows up as rising latency and dropped
 * iterations instead of silently lowering the offered load the way a fixed VU count does.
 */

/** Share of the total rate per traffic mix. */
export const SHARES = {
  browse: 0.6,
  listener: 0.25,
  playback: 0.15,
}

/** Rates are expressed per TIME_UNIT so small totals still split without rounding to zero. */
const TIME_UNIT_SECONDS = 10

const minutes = (value) => `${Math.max(1, Math.round(value * 60 * DURATION_SCALE))}s`
const seconds = (value) => `${Math.max(1, Math.round(value * DURATION_SCALE))}s`

/**
 * @typedef {{ duration: string, target: number }} Stage total iterations/second at the end of the stage
 * @typedef {{ startRate: number, stages: Stage[], mixes: (keyof typeof SHARES)[], maxVUs?: number }} Profile
 */

/** @type {Record<string, () => Profile>} */
const PROFILES = {
  /** Does every request path still answer? One minute, a few iterations per second. */
  smoke: () => ({
    startRate: 3,
    stages: [{ duration: minutes(1), target: 3 }],
    mixes: ['browse', 'listener', 'playback'],
  }),

  /** Expected traffic: ramp to RATE, hold it, ramp down. */
  load: () => ({
    startRate: 0,
    stages: [
      { duration: minutes(2), target: RATE },
      { duration: minutes(10), target: RATE },
      { duration: minutes(1), target: 0 },
    ],
    mixes: ['browse', 'listener', 'playback'],
  }),

  /** Steps up to 4×RATE, holding each step, to see which step degrades first. */
  stress: () => ({
    startRate: 0,
    stages: [0.5, 1, 1.5, 2, 3, 4]
      .flatMap((factor) => [
        { duration: seconds(30), target: RATE * factor },
        { duration: minutes(2), target: RATE * factor },
      ])
      .concat([{ duration: minutes(1), target: 0 }]),
    mixes: ['browse', 'listener', 'playback'],
  }),

  /**
   * The ceiling finder: a straight ramp to MAX_RATE over twenty minutes. The abort thresholds in
   * `thresholdsFor` stop the run once errors or latency break, and the rate at that moment is the
   * answer.
   */
  breakpoint: () => ({
    startRate: 0,
    stages: [{ duration: minutes(20), target: MAX_RATE }],
    mixes: ['browse', 'listener', 'playback'],
  }),

  /** A sudden jump from a fifth of RATE to three times RATE, then recovery at the base rate. */
  spike: () => ({
    startRate: RATE * 0.2,
    stages: [
      { duration: minutes(1), target: RATE * 0.2 },
      { duration: seconds(10), target: RATE * 3 },
      { duration: minutes(1), target: RATE * 3 },
      { duration: seconds(10), target: RATE * 0.2 },
      { duration: minutes(2), target: RATE * 0.2 },
    ],
    mixes: ['browse', 'listener', 'playback'],
  }),

  /** An hour at 60% of RATE: memory growth, connection-pool leaks, Redis key growth. */
  soak: () => ({
    startRate: 0,
    stages: [
      { duration: minutes(2), target: RATE * 0.6 },
      { duration: minutes(60), target: RATE * 0.6 },
      { duration: minutes(1), target: 0 },
    ],
    mixes: ['browse', 'listener', 'playback'],
  }),

  /**
   * The only profile allowed against production: anonymous reads at one per second for two
   * minutes. That is 60 requests a minute, inside both the API throttler (100/min per address) and
   * nginx (10 r/s), so it measures the real network, TLS and nginx path rather than the limits.
   * Fixed on purpose: RATE, DURATION_SCALE and MAX_VUS do not apply. The VU cap keeps a slow
   * production from making k6 open more and more concurrent requests to hold the rate.
   */
  'prod-smoke': () => ({
    startRate: 1,
    stages: [{ duration: '2m', target: 1 }],
    mixes: ['browse'],
    maxVUs: 5,
  }),
}

if (!(PROFILE in PROFILES)) {
  throw new Error(`PROFILE must be one of ${Object.keys(PROFILES).join(', ')}, got "${PROFILE}"`)
}

/** @returns {Profile} */
export function currentProfile() {
  return PROFILES[PROFILE]()
}

/**
 * One ramping-arrival-rate scenario per traffic mix, each running its own exported function.
 *
 * @param {Profile} profile
 */
export function buildScenarios(profile) {
  const shareTotal = profile.mixes.reduce((sum, mix) => sum + SHARES[mix], 0)
  const peak = Math.max(profile.startRate, ...profile.stages.map((stage) => stage.target))

  return Object.fromEntries(
    profile.mixes.map((mix) => {
      const share = SHARES[mix] / shareTotal
      const perUnit = (rate) => Math.round(rate * share * TIME_UNIT_SECONDS)
      const peakPerSecond = peak * share
      return [
        mix,
        {
          executor: 'ramping-arrival-rate',
          exec: mix,
          timeUnit: `${TIME_UNIT_SECONDS}s`,
          startRate: perUnit(profile.startRate),
          stages: profile.stages.map((stage) => ({
            duration: stage.duration,
            target: perUnit(stage.target),
          })),
          preAllocatedVUs: Math.min(
            profile.maxVUs ?? Number.POSITIVE_INFINITY,
            Math.max(2, Math.ceil(peakPerSecond * 0.5)),
          ),
          maxVUs: profile.maxVUs ?? Math.max(5, Math.ceil(MAX_VUS * share)),
          gracefulStop: '30s',
        },
      ]
    }),
  )
}

/**
 * Pass/fail lines for the summary. The latency numbers are starting points, not SLOs — nothing
 * real backs them yet (ADR-0030's objection) — so outside breakpoint and prod-smoke they only
 * report. Breakpoint and prod-smoke abort: one to mark the ceiling, the other to stop hurting
 * production the moment it starts failing.
 *
 * @param {Profile} profile
 */
export function thresholdsFor(profile) {
  const abort = PROFILE === 'breakpoint' || PROFILE === 'prod-smoke'
  const withAbort = (expression, delay) =>
    abort ? { threshold: expression, abortOnFail: true, delayAbortEval: delay } : expression

  /** @type {Record<string, unknown[]>} */
  const thresholds = {
    http_req_failed: [withAbort('rate<0.02', PROFILE === 'prod-smoke' ? '10s' : '1m')],
    checks: ['rate>0.98'],
  }

  const latency = { browse: 300, listener: 400, playback: 800 }
  for (const mix of profile.mixes) {
    thresholds[`http_req_duration{scenario:${mix}}`] = [
      `p(95)<${latency[mix]}`,
      withAbort(`p(99)<${latency[mix] * 5}`, '1m'),
    ]
  }

  return thresholds
}
