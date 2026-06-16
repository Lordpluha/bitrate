import { render } from '@testing-library/react'
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

describe('Table snapshots', () => {
  it('matches snapshot — basic table', () => {
    const { container } = render(
      <Table>
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
      </Table>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — table with caption and footer', () => {
    const { container } = render(
      <Table>
        <TableCaption>A list of invoices</TableCaption>
        <TableHeader>
          <TableRow><TableHead>Invoice</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>INV-001</TableCell></TableRow>
        </TableBody>
        <TableFooter>
          <TableRow><TableCell>Total: $100</TableCell></TableRow>
        </TableFooter>
      </Table>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
