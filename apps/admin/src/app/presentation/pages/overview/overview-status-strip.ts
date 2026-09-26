import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { SessionStore } from '@application/session'
import type { OverviewStatusItem, OverviewStatusItemLink } from './overview-status'

/**
 * A compact row of current-state counts, projected into a chart card's `<ng-content>` — the home
 * for a number that has no time series of its own (a snapshot, or a threshold breach). Each item
 * renders as a link when it carries one and the signed-in operator holds the target route's own
 * permission, plain text otherwise — see `overview-status.ts` for which items carry a link.
 *
 * `urgentId` highlights the one item that means someone must act now (stuck tracks) — never more
 * than one at a time, so the highlight keeps its meaning.
 */
@Component({
  selector: 'app-overview-status-strip',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-status-strip.html',
})
export class OverviewStatusStrip {
  private readonly session = inject(SessionStore)

  readonly items = input.required<OverviewStatusItem[]>()
  readonly urgentId = input<string | null>(null)

  /** `null` when the item has no link, or the operator lacks the target route's permission. */
  protected visibleLink(item: OverviewStatusItem): OverviewStatusItemLink | null {
    const link = item.link
    if (!link) return null
    return this.session.can(link.permission)() ? link : null
  }
}
