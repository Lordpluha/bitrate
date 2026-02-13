import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'

type Swatch = {
  name: string
  colors: Record<string, string>
}

const SwatchList = ({ colors }: { colors: Record<string, string> }) => {
  return (
    <div className="flex overflow-clip rounded-md border shadow">
      {Object.entries(colors).map(([name, value]) => {
        const styles = getComputedStyle(document.documentElement)
        const color = styles.getPropertyValue(value)

        return (
          <div key={value} className="flex w-full flex-col gap-1 pb-3">
            <div className="h-16 w-full" style={{ backgroundColor: `hsl(var(${value}))` }} />
            <p className="text-center font-semibold">{name}</p>
            <p className="text-center text-xs opacity-70">{value}</p>
            <p className="text-center text-xs">{color}</p>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Color tokens for the design system
 */
const meta: Meta<{
  swatch: Swatch[]
}> = {
  title: 'design/Color',
  argTypes: {},
  render: (args) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>
            <span className="sr-only">Swatch</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {args.swatch.map(({ name, colors }) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>
              <SwatchList colors={colors} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export default meta

type Story = StoryObj<typeof meta>

/**
 * Functional color tokens are used to define the core colors of the design system.
 * These colors are used throughout the application for backgrounds, text, borders, etc.
 */
export const Pallete: Story = {
  args: {
    swatch: [
      {
        name: 'Background',
        colors: {
          default: '--color-background',
          foreground: '--color-foreground',
        },
      },
      {
        name: 'Primary',
        colors: {
          default: '--color-primary',
          foreground: '--color-primary-foreground',
        },
      },
      {
        name: 'Secondary',
        colors: {
          default: '--color-secondary',
          foreground: '--color-secondary-foreground',
        },
      },
      {
        name: 'Accent',
        colors: {
          default: '--color-accent-green',
          hover: '--color-accent-green-hover',
        },
      },
      {
        name: 'Muted',
        colors: {
          default: '--color-muted',
          foreground: '--color-muted-foreground',
        },
      },

      {
        name: 'Destructive',
        colors: {
          default: '--color-destructive',
        },
      },
    ],
  },
}

/**
 * Component color tokens are used to define the colors of specific components in the design system.
 * These colors are used to style components like buttons, inputs, and alerts.
 */
export const Themes: Story = {
  args: {
    swatch: [
      {
        name: 'Border',
        colors: {
          default: '--color-border',
          ring: '--color-ring',
        },
      },
      {
        name: 'Card',
        colors: {
          default: '--color-card',
          foreground: '--color-card-foreground',
        },
      },
      {
        name: 'Input',
        colors: {
          default: '--color-input',
        },
      },
      {
        name: 'Popover',
        colors: {
          default: '--color-popover',
          foreground: '--color-popover-foreground',
        },
      },
      {
        name: 'Chart',
        colors: {
          '1': '--color-chart-1',
          '2': '--color-chart-2',
          '3': '--color-chart-3',
          '4': '--color-chart-4',
          '5': '--color-chart-5',
        },
      },
      {
        name: 'Sidebar',
        colors: {
          background: '--color-sidebar',
          foreground: '--color-sidebar-foreground',
          primary: '--color-sidebar-primary',
          'primary-foreground': '--color-sidebar-primary-foreground',
          accent: '--color-sidebar-accent',
          'accent-foreground': '--color-sidebar-accent-foreground',
          border: '--color-sidebar-border',
          ring: '--color-sidebar-ring',
        },
      },
    ],
  },
}
