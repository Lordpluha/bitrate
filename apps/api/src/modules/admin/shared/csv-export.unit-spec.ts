import { describe, expect, it, jest } from '@jest/globals'
import {
  CSV_BOM,
  CSV_EXPORT_MAX_ROWS,
  createCsvExportStream,
  csvExportFilename,
  serializeCsvCell,
  serializeCsvRow,
} from './csv-export'

const collect = async (stream: AsyncIterable<unknown>) => {
  let out = ''
  for await (const chunk of stream) out += String(chunk)
  return out
}

describe('serializeCsvCell', () => {
  it('writes null and undefined as an empty cell', () => {
    expect(serializeCsvCell(null)).toBe('')
    expect(serializeCsvCell(undefined)).toBe('')
  })

  it('writes booleans as true/false and numbers as plain digits', () => {
    expect(serializeCsvCell(true)).toBe('true')
    expect(serializeCsvCell(false)).toBe('false')
    expect(serializeCsvCell(1200)).toBe('1200')
    expect(serializeCsvCell(-3)).toBe('-3')
  })

  it('writes dates as ISO 8601 UTC', () => {
    expect(serializeCsvCell(new Date('2026-03-01T10:20:30.123Z'))).toBe('2026-03-01T10:20:30.123Z')
  })

  it('quotes cells containing a comma, quote, CR or LF and doubles inner quotes', () => {
    expect(serializeCsvCell('a,b')).toBe('"a,b"')
    expect(serializeCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(serializeCsvCell('line1\nline2')).toBe('"line1\nline2"')
    expect(serializeCsvCell('line1\r\nline2')).toBe('"line1\r\nline2"')
    expect(serializeCsvCell('plain')).toBe('plain')
  })

  it.each([
    ['=', "'=SUM(A1)"],
    ['+', "'+1"],
    ['-', "'-1"],
    ['@', "'@x"],
    ['\t', "'\tx"],
  ])('prefixes a string starting with %j with a quote', (lead, expected) => {
    expect(serializeCsvCell(`${lead}${expected.slice(2)}`)).toBe(expected)
  })

  it('prefixes and then quotes a leading carriage return', () => {
    expect(serializeCsvCell('\rx')).toBe(`"'\rx"`)
  })

  it('guards before quoting, so a guarded cell with a comma stays one quoted cell', () => {
    expect(serializeCsvCell('=1+1,2')).toBe(`"'=1+1,2"`)
  })

  it('does not prefix a mid-string operator', () => {
    expect(serializeCsvCell('a=b')).toBe('a=b')
  })
})

describe('serializeCsvRow', () => {
  it('joins cells with commas and ends with CRLF', () => {
    expect(serializeCsvRow(['a', null, 1])).toBe('a,,1\r\n')
  })
})

describe('csvExportFilename', () => {
  it('names the file after the resource and a UTC timestamp', () => {
    expect(csvExportFilename('users', new Date('2026-03-01T10:20:30.123Z'))).toBe(
      'users-20260301T102030Z.csv',
    )
  })
})

describe('createCsvExportStream', () => {
  type Row = { id: string; note: string | null }

  it('writes a BOM, the exact header and each row in column order, paging until done', async () => {
    const pages: Row[][] = [
      [
        { id: 'a', note: 'x' },
        { id: 'b', note: null },
      ],
      [{ id: 'c', note: '=bad' }],
    ]
    const fetchPage = jest.fn<(skip: number, take: number) => Promise<Row[]>>(
      async (skip) => (skip === 0 ? pages[0] : skip === 2 ? pages[1] : []) ?? [],
    )

    const text = await collect(
      createCsvExportStream<Row>({ columns: ['id', 'note'], limit: 3, batchSize: 2, fetchPage }),
    )

    expect(text).toBe(`${CSV_BOM}id,note\r\na,x\r\nb,\r\nc,'=bad\r\n`)
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 2)
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2, 1)
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('stops at the limit even when more rows exist', async () => {
    const fetchPage = jest.fn<(skip: number, take: number) => Promise<Row[]>>(async (_skip, take) =>
      Array.from({ length: take }, (_, i) => ({ id: String(i), note: null })),
    )

    const text = await collect(
      createCsvExportStream<Row>({ columns: ['id', 'note'], limit: 5, batchSize: 2, fetchPage }),
    )

    expect(text.split('\r\n').filter(Boolean)).toHaveLength(1 + 5)
  })

  it('stops early when a page comes back empty', async () => {
    const fetchPage = jest.fn<(skip: number, take: number) => Promise<Row[]>>(async () => [])

    const text = await collect(
      createCsvExportStream<Row>({ columns: ['id', 'note'], limit: 10, batchSize: 2, fetchPage }),
    )

    expect(text).toBe(`${CSV_BOM}id,note\r\n`)
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('caps exports at 50 000 rows', () => {
    expect(CSV_EXPORT_MAX_ROWS).toBe(50_000)
  })
})
