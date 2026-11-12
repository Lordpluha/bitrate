import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoredTile } from '../model/layout'
import {
  layoutDefinitions as definitions,
  placedTile,
} from '../model/layout.fixtures'
import { useCustomizableLayout } from '../model/useCustomizableLayout'
import { CustomizeControls } from './CustomizeControls'
import { LayoutGrid } from './LayoutGrid'

const stored = {
  data: undefined as StoredTile[] | undefined,
  isPending: false,
}
const save = {
  mutate: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  error: null as Error | null,
}

vi.mock('../api/useWorkspaceLayout', () => ({
  useWorkspaceLayout: () => stored,
  useSaveWorkspaceLayout: () => save,
}))

function Workspace() {
  const layout = useCustomizableLayout('artist-1', 'dashboard', definitions)
  return (
    <>
      <CustomizeControls layout={layout} />
      <LayoutGrid layout={layout} renderTile={(id) => <p>{`${id} body`}</p>} />
    </>
  )
}

/** The tiles the artist saved with Done. */
function savedTiles(): StoredTile[] {
  expect(save.mutate).toHaveBeenCalledTimes(1)
  return save.mutate.mock.calls[0]?.[0] as StoredTile[]
}

const tileOf = (tiles: StoredTile[], id: string) =>
  tiles.find((tile) => tile.id === id)

const customize = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Customize' }))
const done = () => fireEvent.click(screen.getByRole('button', { name: 'Done' }))

function stubViewport(compact: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: compact,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

beforeEach(() => {
  stored.data = undefined
  save.mutate.mockReset()
  stubViewport(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LayoutGrid', () => {
  it('moves a removed tile to the drawer and back to the first free spot', () => {
    stored.data = [
      placedTile('activity', { x: 0, y: 0, w: 4, h: 4 }, 'S'),
      placedTile('listening', { x: 4, y: 0, w: 6, h: 3 }),
      placedTile('current', { x: 0, y: 4, w: 8, h: 4 }),
    ]
    render(<Workspace />)
    customize()
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Current release' }),
    )
    expect(screen.queryByText('current body')).not.toBeInTheDocument()
    const drawer = screen.getByRole('complementary', { name: 'Add a block' })
    fireEvent.click(
      within(drawer).getByRole('button', { name: 'Add Current release' }),
    )
    expect(screen.getByText('current body')).toBeInTheDocument()
    expect(within(drawer).queryByRole('button')).not.toBeInTheDocument()
    done()
    expect(tileOf(savedTiles(), 'current')).toMatchObject({
      x: 4,
      y: 3,
      columns: 8,
      rows: 4,
      hidden: false,
    })
  })

  it('saves a removed tile as hidden', () => {
    render(<Workspace />)
    customize()
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Recent activity' }),
    )
    done()
    expect(tileOf(savedTiles(), 'activity')).toMatchObject({ hidden: true })
  })

  it('restores the default layout with Reset', () => {
    stored.data = [
      placedTile('current', { x: 0, y: 3, w: 8, h: 4 }),
      { id: 'activity', size: 'S', columns: 4, rows: 4, hidden: true },
      placedTile('listening', { x: 0, y: 0, w: 6, h: 3 }),
    ]
    render(<Workspace />)
    customize()
    fireEvent.click(screen.getByRole('button', { name: 'Reset to default' }))
    done()
    expect(save.mutate).toHaveBeenCalledWith(null, expect.anything())
  })

  it('moves the focused tile with arrows and resizes it with Shift + arrows', () => {
    render(<Workspace />)
    customize()
    const activity = screen.getByRole('button', {
      name: 'Move Recent activity',
    })
    activity.focus()
    fireEvent.keyDown(activity, { key: 'ArrowDown' })
    fireEvent.keyDown(activity, { key: 'ArrowLeft', shiftKey: true })
    expect(activity).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent(/Recent activity/)
    done()
    expect(tileOf(savedTiles(), 'activity')).toMatchObject({
      x: 8,
      y: 1,
      columns: 3,
      rows: 4,
    })
  })

  it('pulls every tile up with Pull up', () => {
    stored.data = [
      placedTile('current', { x: 0, y: 2, w: 8, h: 4 }),
      placedTile('activity', { x: 8, y: 6, w: 4, h: 4 }, 'S'),
      placedTile('listening', { x: 6, y: 9, w: 6, h: 3 }),
    ]
    render(<Workspace />)
    customize()
    fireEvent.click(screen.getByRole('button', { name: 'Pull up' }))
    done()
    const tiles = savedTiles()
    expect(tileOf(tiles, 'current')).toMatchObject({ x: 0, y: 0 })
    expect(tileOf(tiles, 'activity')).toMatchObject({ x: 8, y: 0 })
    expect(tileOf(tiles, 'listening')).toMatchObject({ x: 6, y: 4 })
  })

  it('drags a tile to the cell under the pointer', () => {
    render(<Workspace />)
    customize()
    const canvas = screen.getByTestId('free-grid')
    // 12 columns of 88 px with 12 px gaps: one column step is 100 px; one row step is 68 px.
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 1188, height: 600 }),
    )
    const handle = screen.getByRole('button', { name: 'Move Listening data' })
    const listening = handle.parentElement as HTMLElement
    vi.spyOn(listening, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 272, width: 588, height: 192 }),
    )
    fireEvent.pointerDown(handle, {
      button: 0,
      clientX: 10,
      clientY: 280,
      pointerId: 1,
    })
    fireEvent.pointerMove(handle, {
      clientX: 610,
      clientY: 552,
      pointerId: 1,
    })
    expect(screen.getByText('listening body')).toBeInTheDocument()
    fireEvent.pointerUp(handle, { clientX: 610, clientY: 552, pointerId: 1 })
    done()
    expect(tileOf(savedTiles(), 'listening')).toMatchObject({
      x: 6,
      y: 8,
      columns: 6,
      rows: 3,
    })
  })

  it('resizes a tile from its top edge, keeping the bottom edge', () => {
    render(<Workspace />)
    customize()
    vi.spyOn(
      screen.getByTestId('free-grid'),
      'getBoundingClientRect',
    ).mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 1188, height: 600 }),
    )
    const tile = screen.getByRole('button', {
      name: 'Move Listening data',
    }).parentElement as HTMLElement
    const top = tile.querySelector('[data-resize="n"]') as HTMLElement
    fireEvent.pointerDown(top, {
      button: 0,
      clientX: 100,
      clientY: 272,
      pointerId: 2,
    })
    fireEvent.pointerMove(top, { clientX: 100, clientY: 340, pointerId: 2 })
    fireEvent.pointerUp(top, { clientX: 100, clientY: 340, pointerId: 2 })
    done()
    expect(tileOf(savedTiles(), 'listening')).toMatchObject({
      x: 0,
      y: 5,
      columns: 6,
      rows: 2,
    })
  })

  it('stacks tiles in reading order on a phone, without editing controls', () => {
    stubViewport(true)
    stored.data = [
      placedTile('listening', { x: 0, y: 6, w: 6, h: 3 }),
      placedTile('activity', { x: 8, y: 0, w: 4, h: 4 }, 'S'),
      placedTile('current', { x: 0, y: 0, w: 8, h: 4 }),
    ]
    render(<Workspace />)
    expect(
      screen.queryByRole('button', { name: 'Customize' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getAllByText(/ body$/).map((node) => node.textContent),
    ).toEqual(['current body', 'activity body', 'listening body'])
    expect(
      screen.queryByRole('button', { name: /^Move / }),
    ).not.toBeInTheDocument()
  })
})
