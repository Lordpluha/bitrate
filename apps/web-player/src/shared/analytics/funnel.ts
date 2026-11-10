import { metrics } from '@sentry/nextjs'

/**
 * The steps of the way from the landing into the player. Each is counted, never tied to a
 * person: no user ids, emails or names go into a step or its attributes.
 * - `landing.view`: the landing was opened;
 * - `landing.scene`: a scene was reached (attribute `scene`), once per visit;
 * - `landing.cta`: a way into the player was clicked (attribute `placement`);
 * - `signup.view` / `signup.submit` / `signup.success`: the registration form.
 */
export type FunnelStep =
  | 'landing.view'
  | 'landing.scene'
  | 'landing.cta'
  | 'signup.view'
  | 'signup.submit'
  | 'signup.success'

/** Short, non-personal labels only: a scene id, a button placement, a layout mode. */
export type FunnelAttributes = Record<string, string | number | boolean>

/**
 * Counts one funnel step in Sentry metrics (Sentry is already the app's monitoring; without a DSN
 * the call is a no-op). Analytics must never break the page, so any failure is swallowed.
 */
export const trackFunnel = ({
  step,
  attributes = {},
}: {
  step: FunnelStep
  attributes?: FunnelAttributes
}) => {
  try {
    metrics.count(`funnel.${step}`, 1, { attributes })
  } catch {
    /* a lost metric is better than a broken click */
  }
}
