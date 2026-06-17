import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

describe('Table integration', () => {
  it('renders multiple data rows', () => {
    const rows = ['Track 1', 'Track 2', 'Track 3']
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row}>
              <TableCell>{row}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>,
    )
    for (const row of rows) {
      expect(screen.getByText(row)).toBeInTheDocument()
    }
    expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1)
  })
})
