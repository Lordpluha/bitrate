import { TestBed } from '@angular/core/testing'
import { ExportRepository } from '@domain/export'
import type { CsvDownload } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ExportArtistsCsvUseCase } from './export-artists-csv.use-case'
import { ExportReportsCsvUseCase } from './export-reports-csv.use-case'
import { ExportTracksCsvUseCase } from './export-tracks-csv.use-case'
import { ExportUsersCsvUseCase } from './export-users-csv.use-case'

const FILE: CsvDownload = { blob: new Blob(['id\r\n']), filename: 'x.csv', truncated: false }

describe('CSV export use cases', () => {
  const repository = {
    exportUsers: vi.fn(),
    exportArtists: vi.fn(),
    exportTracks: vi.fn(),
    exportReports: vi.fn(),
  }

  beforeEach(() => {
    for (const method of Object.values(repository)) method.mockReset().mockResolvedValue(FILE)
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: ExportRepository, useValue: repository }],
    })
  })

  it('exports users with the screen filter unchanged', async () => {
    const filter = { query: 'ann', status: 'all' as const }

    await expect(TestBed.inject(ExportUsersCsvUseCase).execute(filter)).resolves.toBe(FILE)
    expect(repository.exportUsers).toHaveBeenCalledWith(filter)
  })

  it('exports artists with the screen filter unchanged', async () => {
    const filter = { verified: true }

    await expect(TestBed.inject(ExportArtistsCsvUseCase).execute(filter)).resolves.toBe(FILE)
    expect(repository.exportArtists).toHaveBeenCalledWith(filter)
  })

  it('exports tracks with the screen filter unchanged', async () => {
    const filter = { processingStatus: 'FAILED' as const }

    await expect(TestBed.inject(ExportTracksCsvUseCase).execute(filter)).resolves.toBe(FILE)
    expect(repository.exportTracks).toHaveBeenCalledWith(filter)
  })

  it('exports reports with the screen filter unchanged', async () => {
    const filter = { status: 'OPEN' as const }

    await expect(TestBed.inject(ExportReportsCsvUseCase).execute(filter)).resolves.toBe(FILE)
    expect(repository.exportReports).toHaveBeenCalledWith(filter)
  })
})
