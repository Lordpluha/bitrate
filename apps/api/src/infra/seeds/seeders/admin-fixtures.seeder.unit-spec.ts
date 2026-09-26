import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminFixturesSeeder } from './admin-fixtures.seeder'

/** A loosely typed fixture row — enough for these fake tables to key and merge on. */
type Row = Record<string, unknown>

let idSeq = 0
/** A short, readable, deterministic-enough fake id — never a real cuid. */
const nextId = (prefix: string): string => {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

/** The subset of jest-mock-extended's proxy surface these fake tables drive directly. */
type FakeableUniqueModel = {
  findUnique: { mockImplementation: (fn: (args: unknown) => Promise<Row | null>) => void }
  upsert: { mockImplementation: (fn: (args: unknown) => Promise<Row>) => void }
}

/**
 * Backs a `findUnique` + `upsert` pair with an in-memory table keyed by `keyField`, the same
 * pattern `built-in-roles.unit-spec.ts`'s `fakeRoleTable` uses — `update` merges onto the
 * existing row exactly as Postgres would, so a spec can assert what a second run leaves behind.
 */
function fakeUniqueTable(
  mock: FakeableUniqueModel,
  keyField: string,
  prefix: string,
): Map<string, Row> {
  const table = new Map<string, Row>()

  mock.findUnique.mockImplementation((args: unknown) =>
    Promise.resolve(table.get((args as { where: Row }).where[keyField] as string) ?? null),
  )

  mock.upsert.mockImplementation((args: unknown) => {
    const { where, create, update } = args as { where: Row; create: Row; update: Row }
    const key = where[keyField] as string
    const existing = table.get(key)
    const next: Row = existing ? { ...existing, ...update } : { id: nextId(prefix), ...create }
    table.set(key, next)
    return Promise.resolve(next)
  })

  return table
}

describe('AdminFixturesSeeder', () => {
  let prisma: PrismaMock
  let roles: Map<string, Row>
  let staff: Map<string, Row>
  let users: Map<string, Row>
  let artists: Map<string, Row>

  beforeEach(() => {
    idSeq = 0
    resetPrismaMock()
    prisma = prismaMock

    roles = fakeUniqueTable(prisma.role as unknown as FakeableUniqueModel, 'name', 'role')
    roles.set('MODERATOR', { id: 'role-moderator', name: 'MODERATOR', builtIn: true })
    prisma.role.findUniqueOrThrow.mockImplementation(((args: { where: { name: string } }) => {
      const row = roles.get(args.where.name)
      if (!row) throw new Error(`No role named ${args.where.name}`)
      return Promise.resolve(row)
    }) as never)

    staff = fakeUniqueTable(prisma.staff as unknown as FakeableUniqueModel, 'email', 'staff')
    users = fakeUniqueTable(prisma.user as unknown as FakeableUniqueModel, 'email', 'user')
    artists = fakeUniqueTable(prisma.artist as unknown as FakeableUniqueModel, 'email', 'artist')
    fakeUniqueTable(prisma.track as unknown as FakeableUniqueModel, 'isrc', 'track')

    prisma.artist.findFirst.mockResolvedValue({ id: 'base-artist' } as never)
    prisma.track.findFirst.mockResolvedValue({ id: 'base-track' } as never)

    const albums = new Map<string, Row>()
    prisma.album.findFirst.mockImplementation(((args: {
      where: { title: string; artistId: string }
    }) =>
      Promise.resolve(albums.get(`${args.where.title}::${args.where.artistId}`) ?? null)) as never)
    prisma.album.create.mockImplementation(((args: { data: Row }) => {
      const row: Row = { id: nextId('album'), ...args.data }
      albums.set(`${row.title}::${row.artistId}`, row)
      return Promise.resolve(row)
    }) as never)
    prisma.album.update.mockImplementation(((args: { where: { id: string }; data: Row }) => {
      const existing = [...albums.values()].find((row) => row.id === args.where.id)
      const next: Row = { ...existing, ...args.data }
      if (existing) albums.set(`${next.title}::${next.artistId}`, next)
      return Promise.resolve(next)
    }) as never)

    const playlists = new Map<string, Row>()
    prisma.playlist.findFirst.mockImplementation(((args: {
      where: { title: string; userId: string }
    }) =>
      Promise.resolve(playlists.get(`${args.where.title}::${args.where.userId}`) ?? null)) as never)
    prisma.playlist.create.mockImplementation(((args: { data: Row }) => {
      const row: Row = { id: nextId('playlist'), ...args.data }
      playlists.set(`${row.title}::${row.userId}`, row)
      return Promise.resolve(row)
    }) as never)
    prisma.playlist.update.mockImplementation(((args: { where: { id: string }; data: Row }) => {
      const existing = [...playlists.values()].find((row) => row.id === args.where.id)
      const next: Row = { ...existing, ...args.data }
      if (existing) playlists.set(`${next.title}::${next.userId}`, next)
      return Promise.resolve(next)
    }) as never)

    const genres = fakeUniqueTable(prisma.genre as unknown as FakeableUniqueModel, 'slug', 'genre')
    prisma.genre.create.mockImplementation(((args: { data: Row }) => {
      const row: Row = { id: nextId('genre'), ...args.data }
      genres.set(row.slug as string, row)
      return Promise.resolve(row)
    }) as never)

    prisma.podcast.findFirst.mockResolvedValue(null)
    prisma.episode.findFirst.mockResolvedValue(null)

    const reports = new Map<string, Row>()
    prisma.moderationReport.findFirst.mockImplementation(((args: {
      where: { reporterId: string; reason: string }
    }) =>
      Promise.resolve(
        reports.get(`${args.where.reporterId}::${args.where.reason}`) ?? null,
      )) as never)
    prisma.moderationReport.create.mockImplementation(((args: { data: Row }) => {
      const row: Row = { id: nextId('report'), ...args.data }
      reports.set(`${row.reporterId}::${row.reason}`, row)
      return Promise.resolve(row)
    }) as never)
    prisma.moderationReport.update.mockImplementation(((args: {
      where: { id: string }
      data: Row
    }) => {
      const existing = [...reports.values()].find((row) => row.id === args.where.id)
      const next: Row = { ...existing, ...args.data }
      if (existing) reports.set(`${next.reporterId}::${next.reason}`, next)
      return Promise.resolve(next)
    }) as never)

    prisma.auditLog.count.mockResolvedValue(0)
    prisma.auditLog.createMany.mockResolvedValue({ count: 40 } as never)
  })

  it('creates every fixture group on an empty database', async () => {
    const seeder = new AdminFixturesSeeder(prisma)

    const summary = await seeder.run()

    expect(summary).toEqual({
      roles: 2,
      staff: 3,
      users: 4,
      artists: 3,
      tracks: 7,
      albums: 1,
      playlists: 2,
      genres: 1,
      reports: 11,
      auditLogs: 40,
    })
  })

  it('reports zero everywhere on a second run — nothing new is created', async () => {
    const seeder = new AdminFixturesSeeder(prisma)
    await seeder.run()

    // A second run finds the audit-log target already met, same as a real re-run would.
    prisma.auditLog.count.mockResolvedValue(40)
    const summary = await seeder.run()

    expect(summary).toEqual({
      roles: 0,
      staff: 0,
      users: 0,
      artists: 0,
      tracks: 0,
      albums: 0,
      playlists: 0,
      genres: 0,
      reports: 0,
      auditLogs: 0,
    })
  })

  it('keeps a deactivated staff/user/artist row deactivated at its original timestamp across a re-run', async () => {
    const seeder = new AdminFixturesSeeder(prisma)
    await seeder.run()

    const firstStaffDeletedAt = staff.get('fixture-deactivated-staff@bitrate.fixture')?.deletedAt
    const firstUserDeletedAt = users.get('fixture-deactivated-user-1@bitrate.fixture')?.deletedAt
    const firstArtistDeletedAt = artists.get(
      'fixture-deactivated-artist-1@bitrate.fixture',
    )?.deletedAt
    expect(firstStaffDeletedAt).toBeInstanceOf(Date)
    expect(firstUserDeletedAt).toBeInstanceOf(Date)
    expect(firstArtistDeletedAt).toBeInstanceOf(Date)

    prisma.auditLog.count.mockResolvedValue(40)
    await seeder.run()

    expect(staff.get('fixture-deactivated-staff@bitrate.fixture')?.deletedAt).toBe(
      firstStaffDeletedAt,
    )
    expect(users.get('fixture-deactivated-user-1@bitrate.fixture')?.deletedAt).toBe(
      firstUserDeletedAt,
    )
    expect(artists.get('fixture-deactivated-artist-1@bitrate.fixture')?.deletedAt).toBe(
      firstArtistDeletedAt,
    )
  })

  it('never re-hashes the fixture staff password or overwrites its permissions on a re-run', async () => {
    const seeder = new AdminFixturesSeeder(prisma)
    await seeder.run()
    const firstPassword = staff.get('fixture-moderator@bitrate.fixture')?.password
    const firstPermissions = staff.get('fixture-moderator@bitrate.fixture')?.permissions

    prisma.auditLog.count.mockResolvedValue(40)
    await seeder.run()

    const updateCalls = prisma.staff.upsert.mock.calls
      .map(([args]) => args)
      .filter((args) => 'email' in args.where)
    for (const args of updateCalls) {
      expect(args.update).not.toHaveProperty('password')
      expect(args.update).not.toHaveProperty('permissions')
      expect(args.update).not.toHaveProperty('roleId')
    }
    expect(staff.get('fixture-moderator@bitrate.fixture')?.password).toBe(firstPassword)
    expect(staff.get('fixture-moderator@bitrate.fixture')?.permissions).toEqual(firstPermissions)
  })

  it('never writes username through the email-keyed user/artist upsert on a re-run', async () => {
    const seeder = new AdminFixturesSeeder(prisma)
    await seeder.run()
    prisma.auditLog.count.mockResolvedValue(40)
    await seeder.run()

    for (const args of prisma.user.upsert.mock.calls.map(([a]) => a)) {
      expect(args.update).not.toHaveProperty('username')
    }
    for (const args of prisma.artist.upsert.mock.calls.map(([a]) => a)) {
      expect(args.update).not.toHaveProperty('username')
    }
  })

  it('throws when no base artist exists yet, before touching any fixture group', async () => {
    prisma.artist.findFirst.mockResolvedValue(null)
    const seeder = new AdminFixturesSeeder(prisma)

    await expect(seeder.run()).rejects.toThrow(/No artist exists yet/)
    expect(prisma.role.upsert).not.toHaveBeenCalled()
  })

  it('throws when no base track exists yet', async () => {
    prisma.track.findFirst.mockResolvedValue(null)
    const seeder = new AdminFixturesSeeder(prisma)

    await expect(seeder.run()).rejects.toThrow(/No track exists yet/)
  })
})
