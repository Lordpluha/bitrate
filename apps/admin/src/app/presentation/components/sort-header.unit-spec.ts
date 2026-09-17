import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { Sort } from '@domain/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { SortHeader, sortHeaderAriaSort } from './sort-header'

type Field = 'username' | 'email'

function create(): {
  fixture: ReturnType<typeof TestBed.createComponent<SortHeader<Field>>>
  button: HTMLButtonElement
} {
  const fixture = TestBed.createComponent(SortHeader<Field>)
  fixture.componentRef.setInput('field', 'username')
  fixture.componentRef.setInput('label', 'Artist')

  const host = fixture.nativeElement as HTMLElement
  const button = host.querySelector('button') as HTMLButtonElement

  return { fixture, button }
}

describe('sortHeaderAriaSort', () => {
  it('is "none" when the screen is unsorted', () => {
    expect(sortHeaderAriaSort<Field>(null, 'username')).toBe('none')
  })

  it('is "none" for a column that is not the one currently sorted', () => {
    expect(sortHeaderAriaSort<Field>({ field: 'email', direction: 'asc' }, 'username')).toBe(
      'none',
    )
  })

  it('reflects ascending and descending for the sorted column', () => {
    expect(sortHeaderAriaSort<Field>({ field: 'username', direction: 'asc' }, 'username')).toBe(
      'ascending',
    )
    expect(sortHeaderAriaSort<Field>({ field: 'username', direction: 'desc' }, 'username')).toBe(
      'descending',
    )
  })
})

describe('SortHeader', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] })
  })

  it('names the column as not sorted while unsorted', async () => {
    const { fixture, button } = create()
    await fixture.whenStable()

    expect(button.getAttribute('aria-label')).toBe('Sort by Artist, not sorted')
  })

  it('cycles unsorted -> ascending -> descending -> unsorted on successive clicks', async () => {
    const { fixture, button } = create()
    const emitted: (Sort<Field> | null)[] = []
    fixture.componentInstance.sortChange.subscribe((value) => emitted.push(value))

    /**
     * A real caller feeds each emission back through the `sort` input — see `catalog.html`'s
     * `[sort]="query.state().sort"` — so the test does the same between clicks instead of
     * clicking three times against a `sort` input that never changes.
     */
    button.click()
    fixture.componentRef.setInput('sort', emitted.at(-1))
    await fixture.whenStable()

    button.click()
    fixture.componentRef.setInput('sort', emitted.at(-1))
    await fixture.whenStable()

    button.click()

    expect(emitted).toEqual([
      { field: 'username', direction: 'asc' },
      { field: 'username', direction: 'desc' },
      null,
    ])
  })

  it('reflects an externally-set ascending sort in the button label', async () => {
    const { fixture, button } = create()
    fixture.componentRef.setInput('sort', { field: 'username', direction: 'asc' })
    await fixture.whenStable()

    expect(button.getAttribute('aria-label')).toBe('Sort by Artist, ascending')
  })

  it('reflects an externally-set descending sort in the button label', async () => {
    const { fixture, button } = create()
    fixture.componentRef.setInput('sort', { field: 'username', direction: 'desc' })
    await fixture.whenStable()

    expect(button.getAttribute('aria-label')).toBe('Sort by Artist, descending')
  })

  it('stays "not sorted" when the active sort belongs to a different column', async () => {
    const { fixture, button } = create()
    fixture.componentRef.setInput('sort', { field: 'email', direction: 'asc' })
    await fixture.whenStable()

    expect(button.getAttribute('aria-label')).toBe('Sort by Artist, not sorted')
  })
})
