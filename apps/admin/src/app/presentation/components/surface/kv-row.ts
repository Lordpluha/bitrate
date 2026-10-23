import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/**
 * One "label — value" line of a record tile (ID, Uploaded, Role…). The value is projected so it
 * can be a pill, a link or a timestamp; rows separate with the glass hairline.
 */
@Component({
  selector: 'app-kv-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex items-center justify-between gap-4 border-b border-glass-line py-[7px] text-[0.8125rem] last:border-b-0',
  },
  template: `
    <span class="shrink-0 text-muted-foreground">{{ label() }}</span>
    <span class="min-w-0 truncate text-right font-semibold"><ng-content /></span>
  `,
})
export class KvRow {
  readonly label = input.required<string>()
}
