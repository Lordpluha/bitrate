import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu'
import type { ConnectedPosition } from '@angular/cdk/overlay'
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { Router } from '@angular/router'
import { SessionStore, SignOutUseCase } from '@application/session'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideContrast,
  lucideLanguages,
  lucideLogOut,
  lucideMoon,
  lucideSun,
} from '@ng-icons/lucide'
import { LocaleStore } from './locale-store'
import { LOCALE_LABEL } from './locale-toggle'
import { ThemeStore } from './theme-store'

const THEME_ICON = { dark: 'lucideMoon', light: 'lucideSun', dim: 'lucideContrast' } as const

/** Two letters of the username — `mara.ops` → `MA` — for the avatar. */
export function initialsOf(username: string): string {
  const letters = username.replace(/[^\p{L}\p{N}]/gu, '')
  return (letters.slice(0, 2) || '?').toLocaleUpperCase()
}

/**
 * The avatar and its menu: who is signed in, the two personal preferences with their current
 * values, and sign out. The same control sits in the desktop island and the phone top bar.
 *
 * Built on the CDK menu, which already does the menu pattern properly — arrow keys, Escape,
 * focus back to the avatar, typeahead. Language and theme apply on activation; the menu closes,
 * as a menu item should, and the new value is there the next time it opens.
 */
@Component({
  selector: 'app-profile-menu',
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger, NgIcon, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ lucideContrast, lucideLanguages, lucideLogOut, lucideMoon, lucideSun }),
  ],
  templateUrl: './profile-menu.html',
})
export class AppProfileMenu {
  private readonly signOutUseCase = inject(SignOutUseCase)
  private readonly router = inject(Router)
  private readonly themeStore = inject(ThemeStore)
  private readonly localeStore = inject(LocaleStore)

  protected readonly staff = inject(SessionStore).currentStaff
  protected readonly initials = computed(() => initialsOf(this.staff()?.username ?? ''))
  protected readonly theme = this.themeStore.theme
  protected readonly themeIcon = computed(() => THEME_ICON[this.theme()])
  /** The language's own name — never translated, see `LOCALE_LABEL`. */
  protected readonly localeName = computed(() => LOCALE_LABEL[this.localeStore.locale()])

  /** Below-right of the avatar; flips above when the phone's top bar leaves no room. */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 10 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -10 },
  ]

  protected cycleLocale(): void {
    this.localeStore.cycle()
  }

  protected cycleTheme(): void {
    this.themeStore.cycle()
  }

  protected async signOut(): Promise<void> {
    await this.signOutUseCase.execute()
    await this.router.navigate(['/login'])
  }
}
