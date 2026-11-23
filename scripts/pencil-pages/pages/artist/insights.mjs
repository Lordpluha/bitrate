// Artist insights on the artist library: analytics.
import { analyticsPage } from './insights/analytics.mjs'

/** The insights pages by directory. */
export function insightsPages(ui, frames) {
  return { analytics: analyticsPage(ui, frames) }
}
