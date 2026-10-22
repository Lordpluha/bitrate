import { Dialog, type DialogRef } from '@angular/cdk/dialog'
import { Overlay } from '@angular/cdk/overlay'
import { Injectable, inject } from '@angular/core'
import { TranslocoService } from '@jsverse/transloco'
import { AppCommandPalette } from './command-palette'

/**
 * Opens and closes the command palette from anywhere: the ⌘K / Ctrl K shortcut, the centred
 * search in the top bar, the phone's Search tab and the 404 page. One instance at a time — a
 * second shortcut press closes it rather than stacking another.
 */
@Injectable({ providedIn: 'root' })
export class CommandPaletteLauncher {
  private readonly dialog = inject(Dialog)
  private readonly overlay = inject(Overlay)
  private readonly transloco = inject(TranslocoService)
  private ref: DialogRef<unknown, AppCommandPalette> | null = null

  open(): void {
    if (this.ref) return
    this.ref = this.dialog.open(AppCommandPalette, {
      ariaLabel: this.transloco.translate('shell.palette.label'),
      backdropClass: ['bg-background/45', 'backdrop-blur-[6px]'],
      positionStrategy: this.overlay.position().global().top('14vh').centerHorizontally(),
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    })
    this.ref.closed.subscribe(() => {
      this.ref = null
    })
  }

  toggle(): void {
    if (this.ref) this.ref.close()
    else this.open()
  }
}
