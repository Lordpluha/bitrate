import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmLabelImports } from '@spartan-ng/helm/label'

const REASON_MAX_LENGTH = 500

/**
 * An inline destructive-action confirmation with an optional reason. Used by every
 * deactivate/restore/revoke-sessions action on the user and artist detail pages, so the confirm
 * step, the reason textarea, and the pending/disabled state exist in one place rather than three
 * times per page.
 *
 * Deliberately not a modal `<dialog>` — `staff-detail.ts`'s inline armed/confirming pattern
 * already covers focus and keyboard operation (the trigger stays in the DOM and in tab order,
 * Escape is unnecessary because there is no focus trap to escape) without the extra machinery a
 * dialog would add for a single yes/no step.
 */
@Component({
  selector: 'app-confirm-action',
  imports: [HlmButtonImports, HlmLabelImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-action.html',
})
export class ConfirmAction {
  readonly consequence = input.required<string>()
  readonly confirmLabel = input('Confirm')
  readonly pending = input(false)

  readonly confirmed = output<string | undefined>()
  readonly cancelled = output<void>()

  protected readonly reason = signal('')
  protected readonly maxLength = REASON_MAX_LENGTH

  protected setReason(value: string): void {
    this.reason.set(value)
  }

  protected onConfirm(): void {
    const trimmed = this.reason().trim()
    this.confirmed.emit(trimmed.length > 0 ? trimmed : undefined)
  }
}
