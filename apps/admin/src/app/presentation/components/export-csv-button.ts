import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core'
import { CSV_EXPORT_MAX_ROWS, type CsvDownload } from '@domain/shared'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { FileSaver } from './file-saver'

/**
 * The "Export CSV" action of a list page. The page decides whether to show it (the matching
 * `<resource>:export` permission) and what to export — a function that asks the server for the
 * page's current filters and sort. This component only runs it, saves the file, and reports
 * failure or truncation inline; there is no toast.
 */
@Component({
  selector: 'app-export-csv-button',
  imports: [HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './export-csv-button.html',
})
export class ExportCsvButton {
  /** Fetches the CSV for the page's current filters. */
  readonly exporter = input.required<() => Promise<CsvDownload>>()

  private readonly saver = inject(FileSaver)

  protected readonly maxRows = CSV_EXPORT_MAX_ROWS.toLocaleString('en-US')
  protected readonly pending = signal(false)
  protected readonly failure = signal<string | null>(null)
  protected readonly truncated = signal(false)

  protected async run(): Promise<void> {
    this.pending.set(true)
    this.failure.set(null)
    this.truncated.set(false)
    try {
      const file = await this.exporter()()
      this.saver.save(file)
      this.truncated.set(file.truncated)
    } catch {
      this.failure.set('Could not export the CSV. Try again.')
    } finally {
      this.pending.set(false)
    }
  }
}
