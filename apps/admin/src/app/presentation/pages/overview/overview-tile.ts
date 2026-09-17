import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { SessionStore } from '@application/session'
import type { OverviewTile, OverviewTileLink } from './overview-tiles'

/**
 * One dashboard number. Renders as a link when the tile carries one and the signed-in operator
 * holds the target route's own permission, a plain card otherwise — see `buildOverviewTiles` for
 * which tiles carry a link, and `OverviewTileLink.permission` for where it comes from.
 */
@Component({
  selector: 'app-overview-tile',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-tile.html',
})
export class OverviewTileCard {
  private readonly session = inject(SessionStore)

  readonly tile = input.required<OverviewTile>()

  /** `null` when the tile has no link, or the operator lacks the target route's permission. */
  protected readonly visibleLink = computed<OverviewTileLink | null>(() => {
    const link = this.tile().link
    if (!link) return null
    return this.session.can(link.permission)() ? link : null
  })
}
