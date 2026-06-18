import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
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

describe('Table screenshots', () => {
  it('all compositions', async () => {
    render(
      <div data-testid="subject" style={{ display: 'flex', gap: 24, padding: 8 }}>
        <Table>
          <TableCaption>Invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>INV-001</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total: $100</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <Table style={{ width: 320 }}>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Song A</TableCell>
              <TableCell>Artist A</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Song B</TableCell>
              <TableCell>Artist B</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>,
    )
    await expect(page.getByTestId('subject')).toMatchScreenshot()
  })
})
