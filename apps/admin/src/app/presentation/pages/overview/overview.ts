import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { GetOverviewUseCase } from '@application/overview'
import { auditActorLabel } from '@domain/audit'
import type { Overview } from '@domain/overview'
import { CollectionStatus } from '@presentation/components'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { DatePipe } from '@angular/common'
import { OverviewTileCard } from './overview-tile'
import { buildOverviewTiles } from './overview-tiles'

/** The operator landing dashboard: aggregate counts and the most recent operator actions. */
@Component({
  selector: 'app-overview',
  imports: [DatePipe, CollectionStatus, OverviewTileCard, HlmBadgeImports, HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.html',
})
export class OverviewPage {
  private readonly getOverview = inject(GetOverviewUseCase)

  protected readonly actorLabel = auditActorLabel
  protected readonly overview = signal<Overview | null>(null)
  protected readonly loading = signal(true)
  protected readonly failure = signal<string | null>(null)

  protected readonly tiles = computed(() => {
    const current = this.overview()
    return current ? buildOverviewTiles(current) : []
  })

  constructor() {
    void this.load()
  }

  protected async load(): Promise<void> {
    this.loading.set(true)
    this.failure.set(null)
    try {
      this.overview.set(await this.getOverview.execute())
    } catch {
      this.failure.set('Could not load the dashboard.')
    } finally {
      this.loading.set(false)
    }
  }

  protected reload(): void {
    void this.load()
  }
}
