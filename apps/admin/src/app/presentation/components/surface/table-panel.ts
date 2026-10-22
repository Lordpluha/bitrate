import { ChangeDetectionStrategy, Component } from '@angular/core'

/**
 * The glass panel a list lives in: its toolbar (`[panelBar]` — search, filters, count, or the
 * batch bar while rows are selected) above the table, the state message or the skeleton, and
 * the paginator (`[panelFooter]`) at the bottom.
 */
@Component({
  selector: 'app-table-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col rounded-tile border border-glass-line bg-glass shadow-glass backdrop-blur-[22px] backdrop-saturate-150 animate-rise motion-reduce:animate-none [--i:4]',
  },
  template: `
    <ng-content select="[panelBar]" />
    <div class="flex min-h-0 flex-1 flex-col">
      <ng-content />
    </div>
    <ng-content select="[panelFooter]" />
  `,
})
export class TablePanel {}

/** The toolbar row at the top of a table panel. */
@Component({
  selector: 'app-panel-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-wrap items-center gap-2.5 border-b border-glass-line px-4 py-3.5',
  },
  template: `<ng-content />`,
})
export class PanelBar {}
