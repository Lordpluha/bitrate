import { DialogRef } from '@angular/cdk/dialog'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core'
import { Router } from '@angular/router'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideArrowRight,
  lucideAudioLines,
  lucideClipboardCheck,
  lucideContrast,
  lucideDisc3,
  lucideFlag,
  lucideKeyRound,
  lucideLanguages,
  lucideLayoutDashboard,
  lucideListMusic,
  lucideMic,
  lucideMoon,
  lucidePanelLeft,
  lucideScrollText,
  lucideSearch,
  lucideSun,
  lucideTags,
  lucideUserCog,
  lucideUsers,
} from '@ng-icons/lucide'
import { LocaleStore } from './locale-store'
import { SidebarState } from './sidebar-state'
import { ThemeStore } from './theme-store'
import { VisibleNav } from './visible-nav'

const THEME_ICON = { dark: 'lucideMoon', light: 'lucideSun', dim: 'lucideContrast' } as const

/** One row of the palette: where it goes or what it does, under its group caption. */
export type PaletteCommand = {
  id: string
  group: 'navigation' | 'actions'
  /** A transloco key. */
  label: string
  icon: string
  run: () => void
}

/**
 * The command palette (⌘K / Ctrl K, the centred search, the phone's Search tab): jump to any
 * section the operator may open, or switch theme, language and the sidebar — the same things the
 * mouse can reach, one keystroke away.
 *
 * A combobox over a listbox: focus stays in the input, arrows move `aria-activedescendant`, Enter
 * runs, Escape closes (the CDK dialog handles that and returns focus to where it came from).
 * Filtering matches the *translated* label, so a Ukrainian operator types Ukrainian.
 */
@Component({
  selector: 'app-command-palette',
  imports: [NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideAudioLines,
      lucideClipboardCheck,
      lucideContrast,
      lucideDisc3,
      lucideFlag,
      lucideKeyRound,
      lucideLanguages,
      lucideLayoutDashboard,
      lucideListMusic,
      lucideMic,
      lucideMoon,
      lucidePanelLeft,
      lucideScrollText,
      lucideSearch,
      lucideSun,
      lucideTags,
      lucideUserCog,
      lucideUsers,
    }),
  ],
  templateUrl: './command-palette.html',
})
export class AppCommandPalette {
  private readonly dialog = inject(DialogRef)
  private readonly router = inject(Router)
  private readonly transloco = inject(TranslocoService)
  private readonly nav = inject(VisibleNav)
  private readonly theme = inject(ThemeStore)
  private readonly locale = inject(LocaleStore)
  private readonly sidebar = inject(SidebarState)

  protected readonly query = signal('')
  protected readonly active = signal(0)
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input')

  private readonly commands = computed<readonly PaletteCommand[]>(() => [
    ...this.nav.links().map((link) => ({
      id: `nav:${link.path}`,
      group: 'navigation' as const,
      label: link.label,
      icon: link.icon,
      run: () => void this.router.navigateByUrl(link.path),
    })),
    {
      id: 'theme',
      group: 'actions',
      label: 'shell.palette.switchTheme',
      icon: THEME_ICON[this.theme.theme()],
      run: () => this.theme.cycle(),
    },
    {
      id: 'locale',
      group: 'actions',
      label: 'shell.palette.switchLanguage',
      icon: 'lucideLanguages',
      run: () => this.locale.cycle(),
    },
    {
      id: 'sidebar',
      group: 'actions',
      label: 'shell.palette.toggleSidebar',
      icon: 'lucidePanelLeft',
      run: () => this.sidebar.toggle(),
    },
  ])

  /** Matching commands, in palette order; the translated label is what gets matched. */
  protected readonly results = computed(() => {
    const lang = this.locale.locale()
    const needle = this.query().trim().toLocaleLowerCase()
    return this.commands().filter(
      (command) =>
        !needle ||
        this.transloco.translate(command.label, {}, lang).toLocaleLowerCase().includes(needle),
    )
  })

  protected readonly groups = computed(() =>
    (['navigation', 'actions'] as const)
      .map((group) => ({ group, items: this.results().filter((c) => c.group === group) }))
      .filter((entry) => entry.items.length > 0),
  )

  protected readonly activeId = computed(() => {
    const command = this.results()[this.active()]
    return command ? `palette-${command.id}` : null
  })

  protected indexOf(command: PaletteCommand): number {
    return this.results().indexOf(command)
  }

  protected onInput(value: string): void {
    this.query.set(value)
    this.active.set(0)
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.results().length
    if (event.key === 'ArrowDown' && count) {
      this.active.update((i) => (i + 1) % count)
    } else if (event.key === 'ArrowUp' && count) {
      this.active.update((i) => (i - 1 + count) % count)
    } else if (event.key === 'Enter') {
      const command = this.results()[this.active()]
      if (command) this.run(command)
    } else {
      return
    }
    event.preventDefault()
  }

  protected run(command: PaletteCommand): void {
    this.dialog.close()
    command.run()
  }

  /** Keeps the caret in the input when a row is clicked, so typing can go on. */
  protected keepFocus(event: MouseEvent): void {
    event.preventDefault()
    this.input().nativeElement.focus()
  }
}
