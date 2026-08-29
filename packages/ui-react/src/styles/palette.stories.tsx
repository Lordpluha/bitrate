import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { type PaletteColor, type PaletteSection, readPalette } from './token-docs'

const scales = readPalette()

type SwatchListProps = { colors: PaletteColor[] }

/** One row of chips for a scale — the raw value is painted directly, never through a var(). */
function SwatchList({ colors }: SwatchListProps) {
  return (
    <div className="border-border flex flex-wrap overflow-clip rounded-md border shadow-sm">
      {colors.map((color) => (
        <div
          key={color.variable}
          className="bg-background flex min-w-28 flex-1 flex-col gap-1 pb-3"
        >
          <div className="h-16 w-full" style={{ backgroundColor: color.value }} />
          <p className="text-center text-sm font-semibold">{color.shade}</p>
          <p className="text-center text-xs opacity-70">{color.variable}</p>
          <p className="text-center text-xs">{color.value}</p>
        </div>
      ))}
    </div>
  )
}

type PaletteArgs = { scales: PaletteSection[] }

/**
 * Raw palette tokens (`palette.css`) — the named colours every semantic role in
 * `design/Theme` is built from. Extend these before reaching for an inline hex value.
 *
 * This page parses `palette.css` directly, so it cannot list a colour that no longer
 * exists or miss one that was just added.
 */
const meta: Meta<PaletteArgs> = {
  title: 'design/Palette',
  parameters: { layout: 'fullscreen' },
  render: ({ scales: rows }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-56">Scale</TableHead>
          <TableHead>
            <span className="sr-only">Swatches</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((scale) => (
          <TableRow key={scale.title}>
            <TableCell className="align-top">
              <p className="font-semibold">{scale.title}</p>
            </TableCell>
            <TableCell>
              <SwatchList colors={scale.colors} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export default meta

type Story = StoryObj<typeof meta>

/** Every scale `palette.css` declares, in file order. */
export const Scales: Story = { args: { scales } }

/** The numbered ramps — the scales a `bg-<name>-500` utility comes from. */
export const Ramps: Story = {
  args: {
    scales: scales.filter((scale) => scale.colors.every((color) => /^\d+$/.test(color.shade))),
  },
}

/** Single-purpose colours: brand values, pure black/white, and the alpha washes. */
export const Named: Story = {
  args: {
    scales: scales.filter((scale) => scale.colors.some((color) => !/^\d+$/.test(color.shade))),
  },
}
