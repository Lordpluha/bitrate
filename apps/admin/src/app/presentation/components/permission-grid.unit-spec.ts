import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { PermissionGrid } from './permission-grid'

describe('PermissionGrid', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] })
  })

  it('hides protected permissions when hideProtected is set', async () => {
    const fixture = TestBed.createComponent(PermissionGrid)
    fixture.componentRef.setInput('selected', [])
    fixture.componentRef.setInput('hideProtected', true)
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.querySelector('#staff\\:write')).toBeNull()
    expect(host.querySelector('#tracks\\:read')).not.toBeNull()
  })

  it('shows a protected permission when hideProtected is not set', async () => {
    const fixture = TestBed.createComponent(PermissionGrid)
    fixture.componentRef.setInput('selected', [])
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement

    expect(host.querySelector('#staff\\:write')).not.toBeNull()
  })

  it('emits the next selection when a checkbox is toggled on', async () => {
    const fixture = TestBed.createComponent(PermissionGrid)
    fixture.componentRef.setInput('selected', [])
    await fixture.whenStable()

    let emitted: string[] | null = null
    fixture.componentInstance.selectedChange.subscribe((value) => {
      emitted = value
    })

    const host = fixture.nativeElement as HTMLElement
    const checkbox = host.querySelector<HTMLInputElement>('#tracks\\:read')
    checkbox!.checked = true
    checkbox!.dispatchEvent(new Event('change'))

    expect(emitted).toEqual(['tracks:read'])
  })

  it('emits the selection with the permission removed when a checkbox is toggled off', async () => {
    const fixture = TestBed.createComponent(PermissionGrid)
    fixture.componentRef.setInput('selected', ['tracks:read'])
    await fixture.whenStable()

    let emitted: string[] | null = null
    fixture.componentInstance.selectedChange.subscribe((value) => {
      emitted = value
    })

    const host = fixture.nativeElement as HTMLElement
    const checkbox = host.querySelector<HTMLInputElement>('#tracks\\:read')
    checkbox!.checked = false
    checkbox!.dispatchEvent(new Event('change'))

    expect(emitted).toEqual([])
  })

  it('shows an "unheld" marker for a non-protected permission nobody holds', async () => {
    const fixture = TestBed.createComponent(PermissionGrid)
    fixture.componentRef.setInput('selected', [])
    fixture.componentRef.setInput('heldBy', { 'tracks:read': 0 })
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const label = host.querySelector('#tracks\\:read')?.closest('label')

    expect(label?.textContent).toContain('unheld')
  })

  it('shows a holder count instead of the marker when a permission is held', async () => {
    const fixture = TestBed.createComponent(PermissionGrid)
    fixture.componentRef.setInput('selected', [])
    fixture.componentRef.setInput('heldBy', { 'tracks:read': 3 })
    await fixture.whenStable()

    const host = fixture.nativeElement as HTMLElement
    const label = host.querySelector('#tracks\\:read')?.closest('label')

    expect(label?.textContent).toContain('3 holders')
    expect(label?.textContent).not.toContain('unheld')
  })
})
