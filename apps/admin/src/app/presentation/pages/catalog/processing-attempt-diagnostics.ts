import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core'
import type { ProcessingAttempt } from '@domain/track'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { buildDiagnosticsText } from './processing-attempt-diagnostics.lib'

let nextDiagnosticsId = 0

/**
 * The disclosure on a failed/stalled attempt row: command line, stderr tail and stack, plus a
 * clipboard copy. A plain button drives `aria-expanded`/`aria-controls` itself rather than the
 * `hlmCollapsible` primitive, so both attributes stay exactly under this component's control.
 */
@Component({
  selector: 'app-processing-attempt-diagnostics',
  imports: [HlmButtonImports, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="text-xs text-muted-foreground hover:underline"
      [attr.aria-expanded]="expanded()"
      [attr.aria-controls]="contentId"
      (click)="toggle()"
    >
      {{ (expanded() ? 'attempt.diagnostics.hide' : 'attempt.diagnostics.show') | transloco }}
    </button>
    @if (expanded()) {
      <div [id]="contentId" class="mt-2 space-y-2">
        @if (attempt().commandSummary) {
          <pre
            class="whitespace-pre-wrap break-all rounded-xl bg-foreground/5 p-2.5 font-mono text-xs"
            >{{ attempt().commandSummary }}</pre>
        }
        @if (attempt().stderrTail) {
          <pre
            class="whitespace-pre-wrap break-all rounded-xl bg-foreground/5 p-2.5 font-mono text-xs"
            >{{ attempt().stderrTail }}</pre>
        }
        @if (attempt().errorStack) {
          <pre
            class="whitespace-pre-wrap break-all rounded-xl bg-foreground/5 p-2.5 font-mono text-xs"
            >{{ attempt().errorStack }}</pre>
        }
        <button
          hlmBtn
          size="sm"
          variant="outline"
          type="button"
          [attr.aria-label]="
            'attempt.diagnostics.copyLabel' | transloco: { attempt: attempt().attempt }
          "
          (click)="copy()"
        >
          {{ 'attempt.diagnostics.copy' | transloco }}
        </button>
        <p class="text-xs text-muted-foreground" role="status" aria-live="polite">
          {{ announcement() }}
        </p>
      </div>
    }
  `,
})
export class ProcessingAttemptDiagnostics {
  private readonly transloco = inject(TranslocoService)
  readonly attempt = input.required<ProcessingAttempt>()

  protected readonly contentId = `processing-attempt-diagnostics-${nextDiagnosticsId++}`
  protected readonly expanded = signal(false)
  protected readonly announcement = signal('')

  protected toggle(): void {
    this.expanded.update((value) => !value)
  }

  protected async copy(): Promise<void> {
    const text = buildDiagnosticsText(this.attempt())
    try {
      await navigator.clipboard.writeText(text)
      this.announcement.set(this.transloco.translate('attempt.diagnostics.copied'))
    } catch {
      this.announcement.set(this.transloco.translate('attempt.diagnostics.copyFailed'))
    }
  }
}
