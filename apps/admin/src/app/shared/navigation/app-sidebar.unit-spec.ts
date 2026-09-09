import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppSidebar } from './app-sidebar'

describe('AppSidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    })
  })

  /**
   * Guards a bug that types, lint and every other test were blind to: with a host box, the
   * `<aside>` inside it is a `height: auto` block child, so the rail stopped at the last menu
   * item and dragged the footer up with it. `display: contents` removes the host box and makes
   * the `<aside>` the shell's flex item, which is also what makes its `shrink-0` mean anything.
   */
  it('removes its own host box so the aside is the flex item', async () => {
    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.classList.contains('contents')).toBe(true)
    expect(host.querySelector('aside')).not.toBeNull()
  })

  it('renders every section caption and its destinations', async () => {
    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.textContent).toContain('Operations')
    expect(host.textContent).toContain('Accounts')
    expect(host.textContent).toContain('System')
    expect(host.querySelectorAll('nav a')).toHaveLength(5)
  })

  /** The footer is pinned by `nav` taking the slack, not by absolute positioning. */
  it('lets the nav absorb the free space so the footer sits at the bottom', async () => {
    const fixture = TestBed.createComponent(AppSidebar)
    await fixture.whenStable()

    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav')

    expect(nav?.classList.contains('flex-1')).toBe(true)
  })
})
