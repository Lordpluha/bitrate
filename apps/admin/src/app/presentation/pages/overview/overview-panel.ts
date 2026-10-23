import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon } from '@ng-icons/core'
import { BarChart, LineChart } from '@presentation/components'
import { ElapsedPipe } from '@presentation/pipes'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'
import type { PanelModel } from './overview-panel.model'

/**
 * A tile's analysis panel: the headline figures, the range charts and any breakdown, over the
 * page in a dialog (a sheet-like full-width card on phones). The page owns which panel is open —
 * it lives in the URL — and builds the model; this only lays it out. Icons come from the page.
 */
@Component({
  selector: 'app-overview-panel',
  imports: [
    BarChart,
    ElapsedPipe,
    HlmButtonImports,
    HlmDialogImports,
    LineChart,
    NgIcon,
    RouterLink,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview-panel.html',
})
export class OverviewPanelView {
  readonly model = input<PanelModel | null>(null)
  readonly loading = input(false)
  readonly failure = input<string | null>(null)
  readonly emptyMessage = input.required<string>()
  readonly closed = output<void>()
}
