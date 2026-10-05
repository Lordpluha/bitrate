import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { CsvDownload } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ExportCsvButton } from './export-csv-button'
import { FileSaver } from './file-saver'

const download = (truncated = false): CsvDownload => ({
  blob: new Blob(['id\r\n']),
  filename: 'users-20260301T102030Z.csv',
  truncated,
})

describe('ExportCsvButton', () => {
  const save = vi.fn<(file: CsvDownload) => void>()
  const exporter = vi.fn<() => Promise<CsvDownload>>()

  const render = () => {
    const fixture = TestBed.createComponent(ExportCsvButton)
    fixture.componentRef.setInput('exporter', exporter)
    fixture.detectChanges()
    return fixture
  }
  const button = (fixture: ReturnType<typeof render>) =>
    (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement

  beforeEach(() => {
    save.mockReset()
    exporter.mockReset()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: FileSaver, useValue: { save } }],
    })
  })

  it('runs the exporter and hands the file to the saver', async () => {
    const file = download()
    exporter.mockResolvedValue(file)
    const fixture = render()

    button(fixture).click()
    await fixture.whenStable()

    expect(exporter).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith(file)
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')).toBeNull()
  })

  it('disables the button while the export is running', async () => {
    let finish: (file: CsvDownload) => void = () => undefined
    exporter.mockReturnValue(new Promise<CsvDownload>((resolve) => (finish = resolve)))
    const fixture = render()

    button(fixture).click()
    fixture.detectChanges()
    expect(button(fixture).disabled).toBe(true)

    finish(download())
    await fixture.whenStable()
    fixture.detectChanges()
    expect(button(fixture).disabled).toBe(false)
  })

  it('shows an inline error and saves nothing when the export fails', async () => {
    exporter.mockRejectedValue(new Error('boom'))
    const fixture = render()

    button(fixture).click()
    await fixture.whenStable()

    expect(save).not.toHaveBeenCalled()
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('Could not export')
  })

  it('tells the operator when the export stopped at the row cap', async () => {
    exporter.mockResolvedValue(download(true))
    const fixture = render()

    button(fixture).click()
    await fixture.whenStable()

    expect(save).toHaveBeenCalled()
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent,
    ).toContain('50,000')
  })
})
