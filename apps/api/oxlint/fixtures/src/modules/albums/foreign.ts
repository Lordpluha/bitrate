declare const prisma: Record<string, Record<string, (args: object) => unknown>>
declare const tx: typeof prisma

export const direct = () => prisma.track.create({})
export const inTransaction = () => tx.track.deleteMany({})
export const unowned = () => prisma.orphan.create({})
export const ownAlbum = () => prisma.album.upsert({})
