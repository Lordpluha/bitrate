import { Injectable } from '@angular/core'
import type { CsvDownload } from '@domain/shared'

/** Hands a downloaded file to the browser. A service so specs can replace the DOM side effect. */
@Injectable({ providedIn: 'root' })
export class FileSaver {
  save({ blob, filename }: CsvDownload): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}
