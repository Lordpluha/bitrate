import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

const renderTable = () =>
  render(
    <Table>
      <TableCaption>Caption</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Song</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  )

describe('Table', () => {
  it('renders a table element', () => {
    renderTable()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders header, body and footer content', () => {
    renderTable()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Song')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('renders a column header cell', () => {
    renderTable()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
  })

  it('renders a data cell', () => {
    renderTable()
    expect(screen.getByRole('cell', { name: 'Song' })).toBeInTheDocument()
  })

  it('renders the caption', () => {
    renderTable()
    expect(screen.getByText('Caption')).toBeInTheDocument()
  })
})
