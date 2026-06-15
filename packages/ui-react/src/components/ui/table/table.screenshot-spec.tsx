import { render } from '@testing-library/react'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

describe('Table screenshots', () => {
  it('basic table', async () => {
    render(
      <div data-testid="subject" style={{ width: 320 }}>
        <Table>
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
    await expect(page.getByTestId('subject')).toMatchScreenshot('table-basic')
  })
})
