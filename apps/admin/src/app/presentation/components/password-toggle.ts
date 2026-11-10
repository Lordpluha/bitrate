import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide'
import { TranslocoPipe } from '@jsverse/transloco'

/**
 * The eye button that shows or hides a password field. Place it after the field inside a
 * `relative` wrapper and give the field right padding (`pr-10`) so text never runs under it.
 * It stays out of the tab order, like the React `PasswordInput`, so Tab still moves from the
 * password straight to the next control.
 */
@Component({
  selector: 'app-password-toggle',
  imports: [NgIcon, TranslocoPipe],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <button
      type="button"
      tabindex="-1"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      [attr.aria-label]="(visible() ? 'ui.password.hide' : 'ui.password.show') | transloco"
      [attr.aria-pressed]="visible()"
      (click)="toggle()"
    >
      <ng-icon [name]="visible() ? 'lucideEyeOff' : 'lucideEye'" size="16" aria-hidden="true" />
    </button>
  `,
})
export class PasswordToggle {
  /** The password field this button controls. */
  readonly target = input.required<HTMLInputElement>()
  readonly visible = signal(false)

  toggle(): void {
    const next = !this.visible()
    this.visible.set(next)
    this.target().type = next ? 'text' : 'password'
  }
}
