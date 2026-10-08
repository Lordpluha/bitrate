import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from '@jest/globals'
import {
  buildBaseline,
  checkBaseline,
  collectErrorClassNames,
  findLiteralMessages,
  isScannedSourceFile,
} from '../../test/helpers/literal-message-scan'
import baseline from '../../test/i18n-literal-baseline.json'

/** A `${id}` placeholder, built so the lint rule against template syntax in plain strings stays quiet. */
const SUB = '$' + '{id}'

const SRC = join(__dirname, '..')
const API_ROOT = join(SRC, '..')

const listFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    return entry.isDirectory() ? listFiles(full) : [full]
  })

const texts = (file: string, source: string, known: ReadonlySet<string> = new Set()) =>
  findLiteralMessages(file, source, known).map((m) => m.text)

describe('findLiteralMessages (AC3)', () => {
  it('flags a literal passed to a thrown exception, with its position', () => {
    const found = findLiteralMessages(
      'src/modules/x/x.service.ts',
      `\n  throw new BadRequestException('Nope, not allowed')`,
    )

    expect(found).toEqual([
      { file: 'src/modules/x/x.service.ts', line: 2, column: 33, text: 'Nope, not allowed' },
    ])
  })

  it('flags a new exception that is not thrown on the spot', () => {
    expect(texts('src/a.ts', `const failure = new ConflictException('Taken')`)).toEqual(['Taken'])
    expect(texts('src/a.ts', `return Promise.reject(new NotFoundException('Gone'))`)).toEqual([
      'Gone',
    ])
  })

  it('flags double-quoted, template, substituted-template and multi-line literals', () => {
    const source = [
      'throw new NotFoundException(`Track missing`)',
      `throw new NotFoundException(\`Track ${SUB} missing\`)`,
      'throw new ConflictException(',
      '  "Taken"',
      ')',
    ].join('\n')

    expect(texts('src/a.ts', source)).toEqual(['Track missing', `Track ${SUB} missing`, 'Taken'])
  })

  it('flags an object argument with a literal message', () => {
    const source = "throw new BadRequestException({ statusCode: 400, message: 'Object form' })"

    expect(texts('src/a.ts', source)).toEqual(['Object form'])
  })

  it('flags a literal super() call in a class extending an exception', () => {
    const source = [
      'export class GenreNotFoundException extends NotFoundException {',
      '  constructor(id: string) {',
      `    super(\`Genre ${SUB} not found\`)`,
      '  }',
      '}',
    ].join('\n')

    expect(texts('src/modules/x/errors/genre.error.ts', source)).toEqual([`Genre ${SUB} not found`])
  })

  it('flags a super() object with a literal message', () => {
    const source =
      "class A extends ConflictException { constructor() { super({ message: 'Taken', counts: {} }) } }"

    expect(texts('src/a.ts', source)).toEqual(['Taken'])
  })

  it('ignores super() in classes that do not extend an exception', () => {
    expect(texts('src/a.ts', "class A extends Base { constructor() { super('plain') } }")).toEqual(
      [],
    )
  })

  it('treats a class declared in an errors/ folder as an exception, by name and as a base', () => {
    const declaration = 'export class RoleInUseError extends ConflictException {}'
    const known = collectErrorClassNames('src/modules/x/errors/role-in-use.error.ts', declaration)

    expect([...known]).toEqual(['RoleInUseError'])
    expect(collectErrorClassNames('src/modules/x/role.ts', declaration).size).toBe(0)
    expect(texts('src/a.ts', "throw new RoleInUseError('Busy')", known)).toEqual(['Busy'])
    expect(texts('src/a.ts', "throw new RoleInUseError('Busy')")).toEqual([])
    expect(
      texts(
        'src/b.ts',
        "class B extends RoleInUseError { constructor() { super('Busy') } }",
        known,
      ),
    ).toEqual(['Busy'])
  })

  it('does not flag an ordinary Error or an unrelated class', () => {
    expect(texts('src/a.ts', "throw new Error('boom'); new Widget('x')")).toEqual([])
  })

  it('ignores dictionary keys, identifiers and constants', () => {
    const source = [
      "throw new BadRequestException('errors.auth.user_not_found')",
      'throw new UnauthorizedException(UNAUTHORIZED_ERRORS.ACCESS_TOKEN_REQUIRED)',
      "super({ message: 'errors.track.not_found', args: { id } })",
      'throw new TranslatableException(key, 404)',
      "throw new TranslatableException('errors.genre.in_use', 409, { id })",
      'throw new BadRequestException({ message: MESSAGE })',
      'throw new BadRequestException()',
    ].join('\n')

    expect(texts('src/a.ts', source)).toEqual([])
  })

  it('flags a zod message option in a file importing zod, and in dto/schema paths', () => {
    const source = `import { z } from 'zod'\nz.string().min(6, { message: 'Too short' })`
    const bare = `z.string().min(6, { message: 'Too short' })`

    expect(texts('src/modules/x/x.service.ts', source)).toEqual(['Too short'])
    expect(texts('src/modules/x/dtos/login.dto.ts', bare)).toEqual(['Too short'])
    expect(texts('src/modules/x/user.schema.ts', bare)).toEqual(['Too short'])
    expect(texts('src/modules/x/x.service.ts', bare)).toEqual([])
    expect(
      texts('src/modules/x/dtos/login.dto.ts', `z.string().min(6, { message: 'validation.x' })`),
    ).toEqual([])
  })

  it('counts an exception message once even in a file that imports zod', () => {
    const source = `import { z } from 'zod'\nthrow new BadRequestException({ message: 'Once' })`

    expect(texts('src/a.ts', source)).toEqual(['Once'])
  })

  it('skips specs, fixtures and dictionaries', () => {
    expect(isScannedSourceFile('src/modules/x/x.unit-spec.ts')).toBe(false)
    expect(isScannedSourceFile('src/modules/x/__tests__/fixtures/f.ts')).toBe(false)
    expect(isScannedSourceFile('src/modules/x/x.service.ts')).toBe(true)
  })
})

describe('literal baseline ratchet', () => {
  const found = (file: string, count: number) =>
    Array.from({ length: count }, (_, i) => ({ file, line: i + 1, column: 3, text: `Text ${i}` }))

  it('builds a sorted per-file count with no message text', () => {
    const built = buildBaseline([...found('src/b.ts', 2), ...found('src/a.ts', 1)])

    expect(Object.entries(built)).toEqual([
      ['src/a.ts', 1],
      ['src/b.ts', 2],
    ])
  })

  it('passes when every file matches its baseline', () => {
    expect(checkBaseline(found('src/a.ts', 2), { 'src/a.ts': 2 })).toEqual([])
  })

  it('fails a file over its baseline and lists each literal as file:line:column — text', () => {
    const problems = checkBaseline(found('src/a.ts', 2), { 'src/a.ts': 1 })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('src/a.ts:1:3 — Text 0')
    expect(problems[0]).toContain('src/a.ts:2:3 — Text 1')
  })

  it('fails a file under its baseline and asks to lower the number', () => {
    const problems = checkBaseline(found('src/a.ts', 1), { 'src/a.ts': 3 })

    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatch(/src\/a\.ts improved: lower .* from 3 to 1/)
  })

  it('treats a file absent from the baseline as allowing zero', () => {
    expect(checkBaseline(found('src/new.ts', 1), {})).toHaveLength(1)
  })

  it('asks to delete the entry of a file that no longer has literals', () => {
    expect(checkBaseline([], { 'src/gone.ts': 2 })[0]).toMatch(/src\/gone\.ts.* from 2 to 0/)
  })
})

describe('literal message baseline', () => {
  it('matches the literals in src/ exactly — key new messages, and lower the baseline when you fix some', () => {
    const files = listFiles(SRC)
      .map((file) => relative(API_ROOT, file).split('\\').join('/'))
      .filter(isScannedSourceFile)
    const sources = new Map(files.map((file) => [file, readFileSync(join(API_ROOT, file), 'utf8')]))
    const known = new Set(
      [...sources].flatMap(([file, source]) => [...collectErrorClassNames(file, source)]),
    )
    const found = [...sources].flatMap(([file, source]) => findLiteralMessages(file, source, known))

    expect(checkBaseline(found, baseline as Record<string, number>)).toEqual([])
  })
})
