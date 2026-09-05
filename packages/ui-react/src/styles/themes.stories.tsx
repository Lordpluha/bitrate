import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { readThemeGroups, type TokenGroup, type TokenValue } from './token-docs'

const { themes: themeNames, groups } = readThemeGroups()

type ChipProps = { theme: string; value: TokenValue }

/** Paints the value resolved down to a literal, so both themes show at once. */
function Chip({ theme, value }: ChipProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="border-border h-10 w-16 rounded border"
        style={{ background: value.resolved ?? value.raw }}
      />
      <span className="text-text-subdued text-[10px] uppercase">{theme}</span>
      <span className="text-[10px]">{value.resolved ?? value.raw}</span>
    </div>
  )
}

type GroupTableProps = { group: TokenGroup }

function GroupTable({ group }: GroupTableProps) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold">{group.title}</h3>
      <p className="text-text-subdued text-xs">{group.file}</p>
      {group.description ? <p className="mt-1 max-w-3xl text-sm">{group.description}</p> : null}
      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            <TableHead className="w-72">Role</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-56">Themes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {group.roles.map((role) => (
            <TableRow key={role.variable}>
              <TableCell className="align-top">
                <p className="font-mono text-xs">{role.variable}</p>
                <p className="text-text-subdued mt-1 font-mono text-[10px]">
                  {themeNames.map((theme) => role.values[theme]?.raw).join(' / ')}
                </p>
              </TableCell>
              <TableCell className="text-text-secondary align-top text-xs">
                {role.description ?? '—'}
              </TableCell>
              <TableCell>
                <div className="flex gap-3">
                  {themeNames.map((theme) => {
                    const value = role.values[theme]
                    return value ? <Chip key={theme} theme={theme} value={value} /> : null
                  })}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

type ThemeArgs = { groups: TokenGroup[] }

/**
 * Semantic theme roles (`themes/**.css`) — palette colours mapped onto UI roles. Each
 * group below is exactly one part-file, and every theme's value is shown side by side
 * rather than only the one currently applied to `<html>`.
 *
 * This page parses those stylesheets directly, so a role added to a part-file shows up here
 * without anyone editing this file, and a removed one cannot linger.
 */
const meta: Meta<ThemeArgs> = {
  title: 'design/Theme',
  parameters: { layout: 'fullscreen' },
  render: ({ groups: rows }) => (
    <div className="p-4">
      {rows.map((group) => (
        <GroupTable key={group.title} group={group} />
      ))}
    </div>
  ),
}

export default meta

type Story = StoryObj<typeof meta>

/** Every group, in part-file order. */
export const Overview: Story = { args: { groups } }

/** The shadcn role set every other part builds on. */
export const Base: Story = {
  args: { groups: groups.filter((group) => group.file === 'themes/base.css') },
}

/** Roles not tied to any one component. */
export const Global: Story = {
  args: { groups: groups.filter((group) => group.file.startsWith('themes/global/')) },
}

/** Roles scoped to one component or one UI family. */
export const Components: Story = {
  args: { groups: groups.filter((group) => group.file.startsWith('themes/components/')) },
}
