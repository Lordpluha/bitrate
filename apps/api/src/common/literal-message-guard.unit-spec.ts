import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from '@jest/globals'
import {
  findLiteralMessages,
  isScannedSourceFile,
  tallyLiterals,
} from '../../test/helpers/literal-message-scan'
import allowlist from '../../test/i18n-literal-allowlist.json'

const SRC = join(__dirname, '..')
const API_ROOT = join(SRC, '..')

const listFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? listFiles(full) : [full]
  })

describe('findLiteralMessages (AC3)', () => {
  it('flags a literal thrown from an exception constructor', () => {
    const found = findLiteralMessages(
      'src/modules/x/x.service.ts',
      `throw new BadRequestException('Nope, not allowed')`,
    )

    expect(found).toEqual([{ file: 'src/modules/x/x.service.ts', text: 'Nope, not allowed' }])
  })

  it('flags double-quoted, template and multi-line literals and object-form messages', () => {
    const source = [
      'throw new NotFoundException(`Track missing`)',
      'throw new ConflictException(',
      '  "Taken"',
      ')',
      "throw new BadRequestException({ statusCode: 400, message: 'Object form' })",
    ].join('\n')

    expect(findLiteralMessages('src/a.ts', source).map((m) => m.text)).toEqual([
      'Track missing',
      'Taken',
      'Object form',
    ])
  })

  it('ignores dictionary keys and non-literal arguments', () => {
    const source = [
      "throw new BadRequestException('errors.auth.user_not_found')",
      'throw new UnauthorizedException(UNAUTHORIZED_ERRORS.ACCESS_TOKEN_REQUIRED)',
      "super({ message: 'errors.track.not_found', args: { id } })",
      'throw new TranslatableException(key, 404)',
    ].join('\n')

    expect(findLiteralMessages('src/a.ts', source)).toEqual([])
  })

  it('flags a literal DTO message only in dto/schema files', () => {
    const source = `z.string().min(6, { message: 'Too short' })`

    expect(
      findLiteralMessages('src/modules/x/dtos/login.dto.ts', source).map((m) => m.text),
    ).toEqual(['Too short'])
    expect(findLiteralMessages('src/modules/x/x.service.ts', source)).toEqual([])
    expect(
      findLiteralMessages(
        'src/modules/x/dtos/login.dto.ts',
        `z.string().min(6, { message: 'validation.x' })`,
      ),
    ).toEqual([])
  })

  it('skips specs, fixtures and dictionaries', () => {
    expect(isScannedSourceFile('src/modules/x/x.unit-spec.ts')).toBe(false)
    expect(isScannedSourceFile('src/modules/x/__tests__/fixtures/f.ts')).toBe(false)
    expect(isScannedSourceFile('src/modules/x/x.service.ts')).toBe(true)
  })
})

describe('literal message allowlist', () => {
  const found = listFiles(SRC)
    .map((file) => relative(API_ROOT, file).split('\\').join('/'))
    .filter(isScannedSourceFile)
    .flatMap((file) => findLiteralMessages(file, readFileSync(join(API_ROOT, file), 'utf8')))
  const tally = tallyLiterals(found)
  const allowed = allowlist as Record<string, number>

  it('has no literal that is not on the allowlist — key it instead of adding an entry', () => {
    const fresh = Object.entries(tally)
      .filter(([entry, count]) => count > (allowed[entry] ?? 0))
      .map(([entry]) => entry)

    expect(fresh).toEqual([])
  })

  it('has no stale allowlist entry — delete entries once their literal is keyed', () => {
    const stale = Object.entries(allowed)
      .filter(([entry, count]) => (tally[entry] ?? 0) < count)
      .map(([entry]) => entry)

    expect(stale).toEqual([])
  })
})
